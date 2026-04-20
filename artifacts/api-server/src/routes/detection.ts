import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { createWorker } from "tesseract.js";
import fs from "fs";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TMP_DIR = path.resolve(__dirname, "../../uploads/detection-tmp");

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, TMP_DIR),
  filename: (_req, file, cb) => {
    const uid = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    cb(null, `${uid}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /jpeg|jpg|png|gif|bmp|tiff|webp/.test(path.extname(file.originalname).toLowerCase());
    ok ? cb(null, true) : cb(new Error("Solo imágenes"));
  },
});

const router: IRouter = Router();

/** Simulate small OCR B variations on top of the Tesseract result */
function simulateOcrB(text: string | null, baseConf: number): { text: string | null; confidence: number } {
  if (!text) return { text: null, confidence: Math.max(0, baseConf - 0.08) };
  // OCR B occasionally reads numbers slightly differently
  const mutated = text.replace(/\b(\d+)\b/g, (n) => {
    const v = parseInt(n, 10);
    const delta = Math.random() < 0.15 ? (Math.random() < 0.5 ? 1 : -1) : 0;
    return String(Math.max(0, v + delta));
  });
  const conf = Math.min(0.99, baseConf + 0.07 + Math.random() * 0.06);
  return { text: mutated, confidence: conf };
}

/** Simulate CNN visual analysis — returns confidence based on text structure */
function simulateCNN(words: { text: string; confidence: number }[]): { confidence: number; notes: string[] } {
  const notes: string[] = [];
  let conf = 0.78;

  const lowConfWords = words.filter((w) => w.confidence < 60);
  if (lowConfWords.length > words.length * 0.3) {
    conf -= 0.12;
    notes.push(`${lowConfWords.length} palabras con escritura irregular detectadas`);
  }

  const numbers = words.filter((w) => /^\d+$/.test(w.text.trim()));
  if (numbers.length === 0) {
    conf -= 0.05;
    notes.push("No se detectaron valores numéricos claros");
  }

  // Simulate random noise detection
  if (Math.random() < 0.3) {
    conf -= 0.08;
    notes.push("Posible ruido visual en zona inferior del documento");
  }

  return { confidence: Math.max(0.2, Math.min(0.99, conf)), notes };
}

/** Simulate anomaly detection on numeric values */
function simulateAnomalyDetector(text: string | null): { anomalies: string[]; confidence: number } {
  const anomalies: string[] = [];
  if (!text) return { anomalies: ["Sin texto para analizar"], confidence: 0.5 };

  const numbers = (text.match(/\b\d{3,}\b/g) || []).map(Number);
  if (numbers.length === 0) {
    return { anomalies: ["Sin valores numéricos suficientes"], confidence: 0.6 };
  }

  // Check for suspiciously round numbers
  const roundNums = numbers.filter((n) => n % 100 === 0);
  if (roundNums.length > numbers.length * 0.6) {
    anomalies.push(`${roundNums.length} valores sospechosamente redondos`);
  }

  // Check for repeated values
  const freq: Record<number, number> = {};
  for (const n of numbers) freq[n] = (freq[n] || 0) + 1;
  const repeated = Object.entries(freq).filter(([, c]) => c > 2);
  if (repeated.length > 0) {
    anomalies.push(`Valor repetido ${repeated[0][0]} aparece ${repeated[0][1]} veces`);
  }

  // Check for out-of-range totals (simple heuristic)
  const max = Math.max(...numbers);
  if (max > 50000) {
    anomalies.push(`Valor máximo (${max}) fuera de rango típico electoral`);
  }

  const conf = anomalies.length === 0 ? 0.88 : Math.max(0.3, 0.72 - anomalies.length * 0.12);
  return { anomalies, confidence: conf };
}

/** Compute ensemble score (0-100) from all model confidences */
function computeEnsemble(
  ocrAConf: number,
  ocrBConf: number,
  cnnConf: number,
  anomalyConf: number,
  ocrTextMatch: boolean,
): { score: number; inconsistencies: string[] } {
  const inconsistencies: string[] = [];
  let penalty = 0;

  if (!ocrTextMatch) {
    inconsistencies.push("OCR Rápido y OCR Preciso difieren en valores numéricos");
    penalty += 10;
  }
  if (Math.abs(ocrAConf - cnnConf) > 0.25) {
    inconsistencies.push("Discrepancia significativa entre OCR y análisis visual CNN");
    penalty += 5;
  }
  if (anomalyConf < 0.5) {
    inconsistencies.push("El detector de anomalías señala irregularidades estadísticas");
    penalty += 15;
  }

  const weighted = (ocrAConf * 0.25 + ocrBConf * 0.35 + cnnConf * 0.2 + anomalyConf * 0.2) * 100;
  const score = Math.round(Math.max(0, Math.min(100, weighted - penalty)));
  return { score, inconsistencies };
}

router.post("/detection/analyze", upload.single("image"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "Imagen requerida" });
    return;
  }
  const filePath = req.file.path;

  try {
    // — OCR A (real Tesseract.js) —
    const t0 = Date.now();
    let ocrAText: string | null = null;
    let ocrAConf = 0.5;
    let confidenceZones: { x: number; y: number; w: number; h: number; conf: number; text: string }[] = [];
    let wordList: { text: string; confidence: number }[] = [];
    let imageWidth = 1;
    let imageHeight = 1;

    try {
      const worker = await createWorker("eng");
      const { data } = await worker.recognize(filePath);
      await worker.terminate();

      ocrAText = data.text?.trim() || null;
      ocrAConf = (data.confidence ?? 50) / 100;
      imageWidth = data.imageSize?.width || 1;
      imageHeight = data.imageSize?.height || 1;

      // Build word-level confidence zones for the overlay
      wordList = (data.words || []).map((w: any) => ({
        text: w.text,
        confidence: w.confidence,
      }));

      confidenceZones = (data.words || [])
        .filter((w: any) => w.text?.trim())
        .map((w: any) => ({
          x: w.bbox?.x0 ?? 0,
          y: w.bbox?.y0 ?? 0,
          w: (w.bbox?.x1 ?? 0) - (w.bbox?.x0 ?? 0),
          h: (w.bbox?.y1 ?? 0) - (w.bbox?.y0 ?? 0),
          conf: w.confidence ?? 50,
          text: w.text,
        }));
    } catch (e) {
      req.log?.warn?.({ e }, "OCR A failed");
    }
    const durOcrA = Date.now() - t0;

    // — OCR B (simulated) —
    const t1 = Date.now();
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));
    const ocrB = simulateOcrB(ocrAText, ocrAConf);
    const durOcrB = Date.now() - t1;

    // — CNN Vision (simulated) —
    const t2 = Date.now();
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 500));
    const cnn = simulateCNN(wordList);
    const durCNN = Date.now() - t2;

    // — Anomaly Detector (simulated) —
    const t3 = Date.now();
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 400));
    const anomaly = simulateAnomalyDetector(ocrAText);
    const durAnomaly = Date.now() - t3;

    // — Ensemble —
    const ocrANums = (ocrAText || "").match(/\b\d+\b/g) || [];
    const ocrBNums = (ocrB.text || "").match(/\b\d+\b/g) || [];
    const textMatch = JSON.stringify(ocrANums) === JSON.stringify(ocrBNums);
    const { score, inconsistencies } = computeEnsemble(ocrAConf, ocrB.confidence, cnn.confidence, anomaly.confidence, textMatch);

    // Clean up temporary file
    fs.unlinkSync(filePath);

    res.json({
      models: [
        {
          id: "ocr_fast",
          name: "OCR Rápido",
          engine: "Tesseract.js",
          text: ocrAText,
          confidence: ocrAConf,
          duration_ms: durOcrA,
          notes: [],
        },
        {
          id: "ocr_precise",
          name: "OCR Preciso",
          engine: "EasyOCR (sim)",
          text: ocrB.text,
          confidence: ocrB.confidence,
          duration_ms: durOcrB,
          notes: [],
        },
        {
          id: "cnn_vision",
          name: "Visión CNN",
          engine: "ResNet-50 (sim)",
          text: null,
          confidence: cnn.confidence,
          duration_ms: durCNN,
          notes: cnn.notes,
        },
        {
          id: "anomaly",
          name: "Detector Anomalías",
          engine: "IsolationForest (sim)",
          text: null,
          confidence: anomaly.confidence,
          duration_ms: durAnomaly,
          notes: anomaly.anomalies,
        },
      ],
      ensemble_score: score,
      inconsistencies,
      confidence_zones: confidenceZones,
      image_size: { width: imageWidth, height: imageHeight },
    });
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    req.log?.error?.({ err }, "Detection analysis error");
    res.status(500).json({ error: "Error en el análisis" });
  }
});

export default router;
