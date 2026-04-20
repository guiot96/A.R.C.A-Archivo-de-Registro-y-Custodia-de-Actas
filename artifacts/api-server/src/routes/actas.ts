import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { createWorker } from "tesseract.js";
import { db, actasTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { computeImageHash, computeBlockHash, analyzeOcrResult } from "../lib/blockchain";
import { logger } from "../lib/logger";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|bmp|tiff|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const router: IRouter = Router();

router.get("/actas", async (req, res): Promise<void> => {
  const actas = await db.select().from(actasTable).orderBy(desc(actasTable.timestamp));
  res.json(actas);
});

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const all = await db.select().from(actasTable);
  const total = all.length;
  const valid = all.filter((a) => a.status === "valid").length;
  const suspicious = all.filter((a) => a.status === "suspicious").length;
  const inconsistent = all.filter((a) => a.status === "inconsistent").length;
  res.json({ total, valid, suspicious, inconsistent });
});

router.get("/actas/:id/image", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [acta] = await db.select().from(actasTable).where(eq(actasTable.id, id));
  if (!acta) {
    res.status(404).json({ error: "Acta not found" });
    return;
  }
  const imagePath = path.resolve(UPLOADS_DIR, path.basename(acta.image_path));
  if (!fs.existsSync(imagePath)) {
    res.status(404).json({ error: "Image file not found" });
    return;
  }
  res.sendFile(imagePath);
});

router.get("/actas/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [acta] = await db.select().from(actasTable).where(eq(actasTable.id, id));
  if (!acta) {
    res.status(404).json({ error: "Acta not found" });
    return;
  }
  res.json(acta);
});

router.post("/actas/upload", upload.single("image"), async (req, res): Promise<void> => {
  const { mesa_id, departamento, municipio } = req.body;

  if (!mesa_id || typeof mesa_id !== "string") {
    res.status(400).json({ error: "mesa_id is required" });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: "Image file is required" });
    return;
  }

  const filePath = req.file.path;

  try {
    const imageHash = computeImageHash(filePath);

    let ocrText: string | null = null;
    try {
      const worker = await createWorker("eng");
      const { data } = await worker.recognize(filePath);
      ocrText = data.text?.trim() || null;
      await worker.terminate();
    } catch (ocrErr) {
      req.log.warn({ ocrErr }, "OCR failed, continuing without OCR result");
    }

    const status = analyzeOcrResult(ocrText);

    const lastActa = await db
      .select()
      .from(actasTable)
      .orderBy(desc(actasTable.timestamp))
      .limit(1);

    const prevHash = lastActa.length > 0 ? lastActa[0].block_hash : null;
    const timestamp = new Date().toISOString();
    const blockHash = computeBlockHash(prevHash, imageHash, timestamp);

    const [newActa] = await db
      .insert(actasTable)
      .values({
        mesa_id,
        departamento: typeof departamento === "string" ? departamento : null,
        municipio: typeof municipio === "string" ? municipio : null,
        image_path: filePath,
        image_hash: imageHash,
        ocr_result: ocrText,
        status,
        prev_hash: prevHash,
        block_hash: blockHash,
      })
      .returning();

    req.log.info({ id: newActa.id, mesa_id, status }, "Acta uploaded and analyzed");
    res.status(201).json(newActa);
  } catch (err) {
    req.log.error({ err }, "Error processing acta upload");
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ error: "Error processing acta" });
  }
});

router.get("/blockchain/verify", async (req, res): Promise<void> => {
  const actas = await db.select().from(actasTable).orderBy(actasTable.timestamp);

  if (actas.length === 0) {
    res.json({ is_valid: true, block_count: 0, message: "No blocks in chain", broken_at_block: null });
    return;
  }

  let isValid = true;
  let brokenAt: number | null = null;

  for (let i = 0; i < actas.length; i++) {
    const acta = actas[i];
    const expectedPrevHash = i === 0 ? null : actas[i - 1].block_hash;

    if (acta.prev_hash !== expectedPrevHash) {
      isValid = false;
      brokenAt = acta.id;
      break;
    }

    const expectedBlockHash = computeBlockHash(
      acta.prev_hash,
      acta.image_hash,
      acta.timestamp.toISOString(),
    );

    if (acta.block_hash !== expectedBlockHash) {
      isValid = false;
      brokenAt = acta.id;
      break;
    }
  }

  res.json({
    is_valid: isValid,
    block_count: actas.length,
    message: isValid
      ? `Blockchain intact — ${actas.length} blocks verified`
      : `Chain integrity broken at block ${brokenAt}`,
    broken_at_block: brokenAt,
  });
});

router.get("/blockchain/blocks", async (req, res): Promise<void> => {
  const actas = await db.select().from(actasTable).orderBy(desc(actasTable.timestamp));
  const blocks = actas.map((a) => ({
    id: a.id,
    mesa_id: a.mesa_id,
    block_hash: a.block_hash,
    prev_hash: a.prev_hash,
    image_hash: a.image_hash,
    timestamp: a.timestamp,
    status: a.status,
  }));
  res.json(blocks);
});

export default router;
