import crypto from "crypto";
import { readFileSync } from "fs";

export function computeImageHash(filePath: string): string {
  const fileBuffer = readFileSync(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

export function computeBlockHash(
  prevHash: string | null,
  imageHash: string,
  timestamp: string,
): string {
  const data = `${prevHash ?? "GENESIS"}${imageHash}${timestamp}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function analyzeOcrResult(ocrText: string | null): "valid" | "suspicious" | "inconsistent" {
  if (!ocrText || ocrText.trim() === "") {
    return "inconsistent";
  }

  const numbers = ocrText.match(/\d+/g);
  if (!numbers || numbers.length === 0) {
    return "inconsistent";
  }

  const words = ocrText.trim().split(/\s+/);
  if (words.length < 3) {
    return "suspicious";
  }

  const hasWeirdChars = /[^\w\s\d.,;:\-/()áéíóúÁÉÍÓÚñÑ]/.test(ocrText);
  if (hasWeirdChars && numbers.length < 2) {
    return "suspicious";
  }

  return "valid";
}
