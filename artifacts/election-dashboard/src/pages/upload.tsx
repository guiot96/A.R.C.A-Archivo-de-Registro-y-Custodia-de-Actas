import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getListActasQueryKey, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  FileImage, Loader2, CheckCircle2, Hash, MapPin,
  ChevronDown, Shield, X, Plus, Play, ArrowUpRight,
  AlertCircle, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEPARTAMENTOS = [
  "Amazonas","Antioquia","Arauca","Atlántico","Bolívar","Boyacá",
  "Caldas","Caquetá","Casanare","Cauca","Cesar","Chocó","Córdoba",
  "Cundinamarca","Guainía","Guaviare","Huila","La Guajira","Magdalena",
  "Meta","Nariño","Norte de Santander","Putumayo","Quindío","Risaralda",
  "San Andrés y Providencia","Santander","Sucre","Tolima","Valle del Cauca",
  "Vaupés","Vichada","Bogotá D.C.",
];

type QueueStatus = "pending" | "processing" | "done" | "error";

type QueueItem = {
  uid: string;
  file: File;
  preview: string;
  mesaId: string;
  status: QueueStatus;
  result: { id: number; status: string; block_hash: string } | null;
  error: string | null;
};

function statusIcon(status: QueueStatus) {
  switch (status) {
    case "pending":   return <Clock className="w-4 h-4 text-muted-foreground" />;
    case "processing":return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
    case "done":      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case "error":     return <AlertCircle className="w-4 h-4 text-red-500" />;
  }
}

function statusLabel(status: QueueStatus) {
  switch (status) {
    case "pending":    return "En cola";
    case "processing": return "Procesando…";
    case "done":       return "Completada";
    case "error":      return "Error";
  }
}

function statusColor(status: QueueStatus) {
  switch (status) {
    case "pending":    return "border-border";
    case "processing": return "border-primary/40 bg-primary/3";
    case "done":       return "border-emerald-300 bg-emerald-50/40";
    case "error":      return "border-red-300 bg-red-50/40";
  }
}

export default function UploadPage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addFiles = useCallback((files: FileList | File[]) => {
    const newItems: QueueItem[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const preview = URL.createObjectURL(file);
      const mesaId = file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ").toUpperCase();
      newItems.push({ uid, file, preview, mesaId, status: "pending", result: null, error: null });
    }
    setQueue((prev) => [...prev, ...newItems]);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const removeItem = (uid: string) => {
    setQueue((prev) => {
      const item = prev.find((i) => i.uid === uid);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.uid !== uid);
    });
  };

  const updateMesaId = (uid: string, value: string) => {
    setQueue((prev) => prev.map((i) => i.uid === uid ? { ...i, mesaId: value } : i));
  };

  const updateItem = (uid: string, patch: Partial<QueueItem>) => {
    setQueue((prev) => prev.map((i) => i.uid === uid ? { ...i, ...patch } : i));
  };

  const processQueue = async () => {
    const pending = queue.filter((i) => i.status === "pending");
    if (pending.length === 0) return;

    setIsProcessing(true);
    setProcessedCount(0);
    let done = 0;

    for (const item of pending) {
      if (!item.mesaId.trim()) {
        updateItem(item.uid, { status: "error", error: "ID de mesa requerido" });
        done++;
        setProcessedCount(done);
        continue;
      }

      updateItem(item.uid, { status: "processing" });

      try {
        const formData = new FormData();
        formData.append("mesa_id", item.mesaId.trim());
        if (departamento) formData.append("departamento", departamento);
        if (municipio) formData.append("municipio", municipio);
        formData.append("image", item.file);

        const res = await fetch("/api/actas/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.error || `HTTP ${res.status}`);
        }
        const acta = await res.json();
        updateItem(item.uid, { status: "done", result: acta });
      } catch (err) {
        updateItem(item.uid, {
          status: "error",
          error: err instanceof Error ? err.message : "Error desconocido",
        });
      }

      done++;
      setProcessedCount(done);
    }

    queryClient.invalidateQueries({ queryKey: getListActasQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
    setIsProcessing(false);

    const doneItems = queue.filter((i) => i.status === "done" || pending.some((p) => p.uid === i.uid && i.status === "done")).length;
    toast({
      title: "Cola completada",
      description: `${done} actas procesadas.`,
    });
  };

  const pendingCount = queue.filter((i) => i.status === "pending").length;
  const doneCount = queue.filter((i) => i.status === "done").length;
  const errorCount = queue.filter((i) => i.status === "error").length;
  const hasAnyPending = pendingCount > 0;
  const allDone = queue.length > 0 && queue.every((i) => i.status === "done" || i.status === "error");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Subir Actas Electorales</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Selecciona múltiples imágenes — se procesarán en cola, una por una.
        </p>
      </div>

      {/* Progress bar when processing */}
      {isProcessing && (
        <div className="border rounded-xl bg-card p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Procesando cola…
            </span>
            <span className="font-mono text-primary font-bold">{processedCount} / {queue.filter((i) => i.status !== "done" && i.status !== "error").length + processedCount}</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${queue.length > 0 ? (processedCount / (queue.filter((i) => i.status !== "done" && i.status !== "error").length + processedCount)) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Results summary after completion */}
      {allDone && (
        <div className="border rounded-xl bg-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm">Cola completada</p>
            <p className="text-xs text-muted-foreground">
              {doneCount} procesadas correctamente{errorCount > 0 ? `, ${errorCount} con error` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/actas">
              <Button variant="outline" size="sm" className="text-xs">
                Ver actas
                <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
            <Button
              size="sm"
              className="text-xs"
              onClick={() => { setQueue([]); setProcessedCount(0); }}
            >
              Nueva cola
            </Button>
          </div>
        </div>
      )}

      {/* Dropzone */}
      {!isProcessing && (
        <div
          className={cn(
            "border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 text-center",
            queue.length === 0 ? "py-12" : "py-6",
            "hover:border-primary/40 hover:bg-muted/20"
          )}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          data-testid="upload-dropzone"
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
            onChange={handleFileInput}
            data-testid="input-file"
          />
          <div className="flex flex-col items-center gap-2 text-muted-foreground pointer-events-none">
            <div className={cn("rounded-full bg-muted flex items-center justify-center", queue.length === 0 ? "w-14 h-14 mb-1" : "w-10 h-10")}>
              <Plus className={queue.length === 0 ? "w-7 h-7" : "w-5 h-5"} />
            </div>
            {queue.length === 0 ? (
              <>
                <p className="font-semibold text-sm text-foreground">Arrastra imágenes o toca para seleccionar</p>
                <p className="text-xs">JPG, PNG, WEBP — múltiples archivos permitidos</p>
              </>
            ) : (
              <p className="text-xs font-medium">Agregar más actas</p>
            )}
          </div>
        </div>
      )}

      {/* Shared location */}
      {queue.length > 0 && (
        <Card className="border">
          <CardContent className="pt-4 pb-4 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs font-semibold text-foreground">Ubicación compartida</p>
              <span className="text-[10px] text-muted-foreground ml-auto">Aplica a todas las actas</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Departamento</Label>
                <div className="relative">
                  <select
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={isProcessing}
                    data-testid="select-departamento"
                  >
                    <option value="">Sin especificar</option>
                    {DEPARTAMENTOS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Municipio</Label>
                <Input
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value)}
                  placeholder="Municipio (opcional)"
                  className="h-9 text-sm"
                  disabled={isProcessing}
                  data-testid="input-municipio"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Queue list */}
      {queue.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Cola de procesamiento ({queue.length})
            </p>
            {!isProcessing && pendingCount > 0 && (
              <button
                className="text-xs text-destructive hover:underline"
                onClick={() => setQueue((prev) => prev.filter((i) => i.status !== "pending"))}
              >
                Limpiar pendientes
              </button>
            )}
          </div>

          <div className="space-y-2">
            {queue.map((item, index) => (
              <div
                key={item.uid}
                className={cn("border rounded-xl overflow-hidden transition-all", statusColor(item.status))}
                data-testid={`queue-item-${index}`}
              >
                <div className="flex items-start gap-3 p-3">
                  {/* Image thumbnail */}
                  <div className="w-14 h-14 rounded-lg border bg-muted overflow-hidden flex-shrink-0 relative">
                    <img
                      src={item.preview}
                      alt={item.file.name}
                      className="w-full h-full object-cover"
                    />
                    {item.status === "processing" && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      </div>
                    )}
                    {item.status === "done" && (
                      <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      {statusIcon(item.status)}
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        item.status === "pending" ? "text-muted-foreground" :
                        item.status === "processing" ? "text-primary" :
                        item.status === "done" ? "text-emerald-600" :
                        "text-red-600"
                      )}>
                        {statusLabel(item.status)}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50 ml-auto font-mono truncate max-w-[100px]" title={item.file.name}>
                        {(item.file.size / 1024).toFixed(0)} KB
                      </span>
                    </div>

                    {/* Mesa ID input (editable only when pending) */}
                    {item.status === "pending" ? (
                      <Input
                        value={item.mesaId}
                        onChange={(e) => updateMesaId(item.uid, e.target.value)}
                        placeholder="ID de Mesa Electoral"
                        className="h-8 text-xs font-mono"
                        data-testid={`input-mesa-${index}`}
                      />
                    ) : (
                      <p className="font-mono text-sm font-bold text-foreground">{item.mesaId}</p>
                    )}

                    {/* Result: block hash */}
                    {item.status === "done" && item.result && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                            item.result.status === "valid" ? "bg-emerald-100 text-emerald-700" :
                            item.result.status === "suspicious" ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                          )}>
                            {item.result.status === "valid" ? "Válida" : item.result.status === "suspicious" ? "Sospechosa" : "Inconsistente"}
                          </span>
                          <Link href={`/actas/${item.result.id}`}>
                            <button className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                              Ver detalle <ArrowUpRight className="w-2.5 h-2.5" />
                            </button>
                          </Link>
                        </div>
                        <div className="bg-muted/50 border rounded px-2 py-1">
                          <p className="font-mono text-[10px] text-muted-foreground break-all">
                            {item.result.block_hash.substring(0, 32)}…
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Error */}
                    {item.status === "error" && item.error && (
                      <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                        {item.error}
                      </p>
                    )}
                  </div>

                  {/* Remove button (pending only) */}
                  {item.status === "pending" && !isProcessing && (
                    <button
                      onClick={() => removeItem(item.uid)}
                      className="text-muted-foreground hover:text-destructive p-1 transition-colors flex-shrink-0"
                      data-testid={`btn-remove-${index}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {queue.length > 0 && !allDone && (
        <div className="flex gap-3">
          {!isProcessing && !allDone && (
            <Button
              variant="outline"
              className="flex-none"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Agregar
            </Button>
          )}
          <Button
            className="flex-1 h-11 text-sm font-semibold"
            onClick={processQueue}
            disabled={isProcessing || !hasAnyPending}
            data-testid="button-submit"
          >
            {isProcessing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando {processedCount}…</>
            ) : (
              <><Play className="mr-2 h-4 w-4" />Procesar cola ({pendingCount} {pendingCount === 1 ? "acta" : "actas"})</>
            )}
          </Button>
        </div>
      )}

      {/* Empty state */}
      {queue.length === 0 && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { n: "01", label: "SHA-256", desc: "Huella única por imagen" },
            { n: "02", label: "OCR", desc: "Extracción de texto" },
            { n: "03", label: "Blockchain", desc: "Registro inmutable" },
          ].map((s) => (
            <div key={s.n} className="border rounded-xl p-3 text-center bg-card">
              <p className="text-[10px] font-mono text-muted-foreground/50">{s.n}</p>
              <p className="text-xs font-bold text-foreground mt-0.5">{s.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Security note */}
      <div className="flex items-start gap-3 p-3 rounded-xl border bg-primary/5 border-primary/15">
        <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-primary/80 leading-relaxed">
          Cada acta se procesa de forma independiente: SHA-256 del archivo → OCR → encadenamiento al bloque anterior. El orden de la cola determina el orden en el ledger.
        </p>
      </div>
    </div>
  );
}
