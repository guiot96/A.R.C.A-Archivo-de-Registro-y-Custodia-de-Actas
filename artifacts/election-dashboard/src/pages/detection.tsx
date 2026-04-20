import { useState, useRef, useEffect, useCallback } from "react";
import {
  Eye, Upload, CheckCircle2, Loader2, AlertTriangle,
  Brain, Zap, Activity, Shield, X, BarChart3, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ────────── Types ──────────────────────────────────────────────────────────────
type ModelStatus = "idle" | "running" | "done" | "skipped";

type ModelDef = {
  id: string;
  name: string;
  engine: string;
  icon: React.ElementType;
  color: string;
  description: string;
};

type ModelResult = {
  id: string;
  name: string;
  engine: string;
  text: string | null;
  confidence: number;
  duration_ms: number;
  notes: string[];
};

type ConfidenceZone = {
  x: number; y: number; w: number; h: number;
  conf: number; text: string;
};

type AnalysisResult = {
  models: ModelResult[];
  ensemble_score: number;
  inconsistencies: string[];
  confidence_zones: ConfidenceZone[];
  image_size: { width: number; height: number };
};

// ────────── Config ─────────────────────────────────────────────────────────────
const MODEL_DEFS: ModelDef[] = [
  {
    id: "ocr_fast",
    name: "OCR Rápido",
    engine: "Tesseract.js",
    icon: Zap,
    color: "text-blue-500",
    description: "Extracción rápida de texto, menor precisión en escritura irregular",
  },
  {
    id: "ocr_precise",
    name: "OCR Preciso",
    engine: "EasyOCR",
    icon: Eye,
    color: "text-violet-500",
    description: "Mayor robustez ante escritura manual y documentos degradados",
  },
  {
    id: "cnn_vision",
    name: "Visión CNN",
    engine: "ResNet-50",
    icon: Brain,
    color: "text-amber-500",
    description: "Detecta formas, ruido visual y escritura irregular mediante CNN",
  },
  {
    id: "anomaly",
    name: "Detector Anomalías",
    engine: "IsolationForest",
    icon: Activity,
    color: "text-red-500",
    description: "Identifica valores estadísticamente inusuales en el documento",
  },
];

const SIMULATED_DURATIONS = [1200, 2400, 1800, 1100]; // ms, for animation only

// ────────── Helpers ────────────────────────────────────────────────────────────
function confColor(conf: number) {
  if (conf >= 0.8) return "text-emerald-600";
  if (conf >= 0.6) return "text-amber-600";
  return "text-red-600";
}

function confBg(conf: number) {
  if (conf >= 0.8) return "bg-emerald-500";
  if (conf >= 0.6) return "bg-amber-400";
  return "bg-red-500";
}

function scoreLabel(score: number) {
  if (score >= 80) return { label: "Confiable", color: "text-emerald-600", ring: "ring-emerald-400" };
  if (score >= 55) return { label: "Revisar", color: "text-amber-600", ring: "ring-amber-400" };
  return { label: "Alta anomalía", color: "text-red-600", ring: "ring-red-400" };
}

// Draw bounding box overlay on canvas
function drawOverlay(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  zones: ConfidenceZone[],
  imgW: number,
  imgH: number,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dW = canvas.width;
  const dH = canvas.height;
  const scaleX = dW / (imgW || dW);
  const scaleY = dH / (imgH || dH);

  ctx.clearRect(0, 0, dW, dH);
  ctx.drawImage(img, 0, 0, dW, dH);

  for (const z of zones) {
    const x = z.x * scaleX;
    const y = z.y * scaleY;
    const w = z.w * scaleX;
    const h = z.h * scaleY;
    if (w < 2 || h < 2) continue;

    let color = "rgba(34,197,94,0.35)";
    if (z.conf < 60) color = "rgba(239,68,68,0.35)";
    else if (z.conf < 80) color = "rgba(251,191,36,0.35)";

    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);

    let borderColor = "rgba(34,197,94,0.8)";
    if (z.conf < 60) borderColor = "rgba(239,68,68,0.8)";
    else if (z.conf < 80) borderColor = "rgba(251,191,36,0.8)";
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  }
}

// ────────── Component ──────────────────────────────────────────────────────────
export default function DetectionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(
    new Set(MODEL_DEFS.map((m) => m.id)),
  );
  const [modelStatuses, setModelStatuses] = useState<Record<string, ModelStatus>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);
    setResult(null);
    setError(null);
    setModelStatuses({});
  }, []);

  const toggleModel = (id: string) => {
    setSelectedModels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size > 1) next.delete(id); }
      else next.add(id);
      return next;
    });
  };

  // Animate model statuses while waiting for API
  const animateProgress = useCallback(async (modelsToRun: string[]) => {
    const initial: Record<string, ModelStatus> = {};
    for (const m of MODEL_DEFS) {
      initial[m.id] = modelsToRun.includes(m.id) ? "running" : "skipped";
    }
    setModelStatuses(initial);

    const timers: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;
    for (let i = 0; i < modelsToRun.length; i++) {
      const id = modelsToRun[i];
      cumulative += SIMULATED_DURATIONS[i] ?? 1000;
      const delay = cumulative;
      timers.push(
        setTimeout(() => {
          setModelStatuses((prev) => ({ ...prev, [id]: "done" }));
        }, delay),
      );
    }
    return timers;
  }, []);

  const analyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    const modelsToRun = MODEL_DEFS.filter((m) => selectedModels.has(m.id)).map((m) => m.id);
    const timers = await animateProgress(modelsToRun);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const res = await fetch("/api/detection/analyze", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `HTTP ${res.status}`);
      }
      const data: AnalysisResult = await res.json();
      timers.forEach(clearTimeout);

      // Mark all selected models done immediately
      const done: Record<string, ModelStatus> = {};
      for (const m of MODEL_DEFS) {
        done[m.id] = modelsToRun.includes(m.id) ? "done" : "skipped";
      }
      setModelStatuses(done);
      setResult(data);
    } catch (err) {
      timers.forEach(clearTimeout);
      setError(err instanceof Error ? err.message : "Error desconocido");
      setModelStatuses({});
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Draw overlay whenever result + showOverlay + canvas change
  useEffect(() => {
    if (!result || !canvasRef.current || !previewUrl) return;
    if (!showOverlay) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx && imgRef.current) {
        ctx.drawImage(imgRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      return;
    }
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      if (canvasRef.current) {
        drawOverlay(canvasRef.current, img, result.confidence_zones, result.image_size.width, result.image_size.height);
      }
    };
    img.src = previewUrl;
  }, [result, showOverlay, previewUrl]);

  const scoreInfo = result ? scoreLabel(result.ensemble_score) : null;

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-md bg-violet-600 flex items-center justify-center">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Detección Visual</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Sistema de consenso multi-modelo para validar documentos electorales mediante visión artificial.
        </p>
      </div>

      {/* Upload zone */}
      {!isAnalyzing && (
        <div
          className={cn(
            "border-2 border-dashed rounded-xl cursor-pointer transition-all text-center",
            selectedFile ? "p-3" : "py-10",
            "hover:border-violet-400/40 hover:bg-violet-50/5",
          )}
          onClick={() => !selectedFile && fileInputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
          />
          {selectedFile && previewUrl ? (
            <div className="flex items-center gap-3">
              <img src={previewUrl} alt="preview" className="w-16 h-16 object-cover rounded-lg border flex-shrink-0" />
              <div className="text-left flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(0)} KB</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setPreviewUrl(null); setResult(null); }}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-1">
                <Upload className="w-6 h-6" />
              </div>
              <p className="font-semibold text-sm text-foreground">Sube una imagen del documento</p>
              <p className="text-xs">JPG, PNG, WEBP</p>
            </div>
          )}
        </div>
      )}

      {/* Model selector */}
      {!isAnalyzing && !result && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Modelos activos
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MODEL_DEFS.map((m) => {
              const active = selectedModels.has(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggleModel(m.id)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl border text-left transition-all",
                    active
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-card text-muted-foreground opacity-60"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0", active && "bg-primary/10")}>
                    <m.icon className={cn("w-4 h-4", active ? m.color : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-foreground">{m.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{m.engine}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{m.description}</p>
                  </div>
                  <div className={cn(
                    "w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center",
                    active ? "border-primary bg-primary" : "border-border"
                  )}>
                    {active && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Analyze button */}
      {!isAnalyzing && !result && (
        <Button
          className="w-full h-11 text-sm font-semibold"
          onClick={analyze}
          disabled={!selectedFile || selectedModels.size === 0}
          data-testid="button-analyze"
        >
          <Eye className="mr-2 w-4 h-4" />
          Analizar con {selectedModels.size} {selectedModels.size === 1 ? "modelo" : "modelos"}
        </Button>
      )}

      {/* Processing panel */}
      {(isAnalyzing || (result && Object.keys(modelStatuses).length > 0)) && (
        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
              {!isAnalyzing && result && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              <span className="text-sm font-semibold">
                {isAnalyzing ? "Analizando documento…" : "Análisis completado"}
              </span>
            </div>
            {!isAnalyzing && result && (
              <button
                onClick={() => { setResult(null); setModelStatuses({}); }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Nuevo análisis
              </button>
            )}
          </div>
          <div className="divide-y">
            {MODEL_DEFS.map((m) => {
              const st = modelStatuses[m.id] ?? "idle";
              if (st === "skipped") return null;
              const res = result?.models.find((r) => r.id === m.id);
              return (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={cn("w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0")}>
                    <m.icon className={cn("w-3.5 h-3.5", m.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">{m.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{m.engine}</span>
                      {res && (
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {res.duration_ms}ms
                        </span>
                      )}
                    </div>
                    {/* Confidence bar */}
                    {res && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-700", confBg(res.confidence))}
                            style={{ width: `${res.confidence * 100}%` }}
                          />
                        </div>
                        <span className={cn("text-[11px] font-bold font-mono w-10 text-right", confColor(res.confidence))}>
                          {(res.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                    {res?.notes && res.notes.length > 0 && (
                      <p className="text-[10px] text-amber-600 mt-1">{res.notes[0]}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 w-6 flex justify-center">
                    {st === "running" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                    {st === "done" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-3 rounded-xl border border-red-200 bg-red-50/40">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Ensemble score */}
          <div className="border rounded-xl p-4 bg-card flex items-center gap-5">
            <div className={cn(
              "w-20 h-20 rounded-full ring-4 flex flex-col items-center justify-center flex-shrink-0",
              scoreInfo!.ring,
            )}>
              <span className="text-2xl font-black text-foreground font-mono">{result.ensemble_score}</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">/ 100</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Score de integridad</p>
              <p className={cn("text-xl font-bold mt-0.5", scoreInfo!.color)}>{scoreInfo!.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ponderación: OCR×0.6 + Visión×0.2 + Anomalía×0.2
              </p>
            </div>
          </div>

          {/* Inconsistency alerts */}
          {result.inconsistencies.length > 0 && (
            <div className="border border-amber-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-amber-50/50 border-b border-amber-200 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-semibold text-amber-800">
                  {result.inconsistencies.length} inconsistencia{result.inconsistencies.length > 1 ? "s" : ""} detectada{result.inconsistencies.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="divide-y divide-amber-100">
                {result.inconsistencies.map((inc, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5 flex-shrink-0">▲</span>
                    <p className="text-xs text-amber-900">{inc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.inconsistencies.length === 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/30">
              <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <p className="text-sm text-emerald-800 font-medium">Sin inconsistencias entre modelos</p>
            </div>
          )}

          {/* Comparison table */}
          <div className="border rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b bg-muted/30 flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">Comparativa de modelos</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/20">
                    <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Modelo</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Resultado</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground">Confianza</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {result.models.map((m) => {
                    const def = MODEL_DEFS.find((d) => d.id === m.id);
                    return (
                      <tr key={m.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {def && <def.icon className={cn("w-3.5 h-3.5", def.color)} />}
                            {m.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{m.engine}</div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[180px]">
                          {m.text ? (
                            <span className="font-mono text-[10px] line-clamp-2">{m.text.substring(0, 80)}{m.text.length > 80 ? "…" : ""}</span>
                          ) : m.notes.length > 0 ? (
                            <span className="text-[10px] italic">{m.notes[0]}</span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground/50 italic">Sin texto</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={cn("font-bold font-mono", confColor(m.confidence))}>
                            {(m.confidence * 100).toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual overlay */}
          {result.confidence_zones.length > 0 && (
            <div className="border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">Mapa de confianza visual</span>
                </div>
                <button
                  onClick={() => setShowOverlay((v) => !v)}
                  className={cn(
                    "text-[10px] font-medium px-2.5 py-1 rounded-full border transition-colors",
                    showOverlay ? "bg-primary text-white border-primary" : "text-muted-foreground border-border"
                  )}
                >
                  {showOverlay ? "Overlay activo" : "Overlay desactivado"}
                </button>
              </div>
              <div className="p-3">
                {/* Legend */}
                <div className="flex items-center gap-4 mb-3 flex-wrap">
                  {[
                    { color: "bg-emerald-400", label: "Alta confianza (≥80%)" },
                    { color: "bg-amber-400", label: "Media (60–80%)" },
                    { color: "bg-red-400", label: "Baja (<60%)" },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className={cn("w-3 h-3 rounded-sm", l.color)} />
                      <span className="text-[10px] text-muted-foreground">{l.label}</span>
                    </div>
                  ))}
                </div>
                {/* Canvas */}
                {previewUrl && (
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={Math.round(600 * (result.image_size.height / (result.image_size.width || 1)))}
                    className="w-full rounded-lg border"
                  />
                )}
                <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  {result.confidence_zones.length} zonas analizadas · basado en confianza OCR por palabra
                </p>
              </div>
            </div>
          )}

          {/* OCR text output */}
          {result.models[0]?.text && (
            <div className="border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b bg-muted/30">
                <span className="text-xs font-semibold text-foreground">Texto extraído (OCR Rápido)</span>
              </div>
              <pre className="p-4 text-[11px] font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-48 overflow-auto">
                {result.models[0].text}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
