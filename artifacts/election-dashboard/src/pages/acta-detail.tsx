import { useParams, Link } from "wouter";
import { useGetActa, getGetActaQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Copy, Hash, MapPin, ShieldCheck, FileText } from "lucide-react";
import { StatusBadge } from "./dashboard";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function HashBlock({ label, value, highlight }: { label: string; value: string | null; highlight?: boolean }) {
  const { toast } = useToast();
  if (!value) return null;
  const copy = () => {
    navigator.clipboard.writeText(value);
    toast({ title: "Copiado", description: `${label} copiado al portapapeles.` });
  };
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{label}</p>
        <button onClick={copy} className="text-muted-foreground hover:text-primary transition-colors p-0.5">
          <Copy className="w-3 h-3" />
        </button>
      </div>
      <div className={cn(
        "rounded-md p-3 border font-mono text-[11px] break-all leading-relaxed",
        highlight ? "bg-primary/5 border-primary/20 text-primary/90" : "bg-muted/40 border-border text-muted-foreground"
      )}>
        {value}
      </div>
    </div>
  );
}

export default function ActaDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const { data: acta, isLoading, error } = useGetActa(id, {
    query: { enabled: !!id, queryKey: getGetActaQueryKey(id) }
  });
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Skeleton className="h-[360px] rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-[160px] rounded-lg" />
            <Skeleton className="h-[180px] rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !acta) {
    return (
      <div className="text-center py-16">
        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <h2 className="text-lg font-semibold text-foreground">Registro no encontrado</h2>
        <p className="text-sm text-muted-foreground mt-1">El acta solicitado no existe o fue eliminado.</p>
        <Link href="/actas">
          <Button variant="outline" className="mt-4">Volver al listado</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/actas">
          <Button variant="ghost" size="icon" className="h-8 w-8 mt-0.5 flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight font-mono">Mesa: {acta.mesa_id}</h1>
            <StatusBadge status={acta.status} />
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border">#{acta.id}</span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            {(acta.departamento || acta.municipio) && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {[acta.departamento, acta.municipio].filter(Boolean).join(", ")}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(acta.timestamp).toLocaleString("es-CO", { dateStyle: "full", timeStyle: "short" })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Image column */}
        <Card className="border overflow-hidden">
          <CardHeader className="py-3 px-4 border-b bg-muted/30">
            <CardTitle className="text-sm font-semibold">Imagen del Acta Fisico</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="bg-muted min-h-64 flex items-center justify-center relative">
              <img
                src={`/api/actas/${acta.id}/image`}
                alt={`Acta ${acta.mesa_id}`}
                className="w-full object-contain max-h-[480px]"
                data-testid={`img-acta-${acta.id}`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-4">
          {/* Blockchain info */}
          <Card className="border">
            <CardHeader className="py-3 px-4 border-b bg-muted/30 flex flex-row items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Datos Criptograficos</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <HashBlock label="Hash SHA256 de Imagen" value={acta.image_hash} />
              <HashBlock label="Block Hash (encadenado)" value={acta.block_hash} highlight />
              {acta.prev_hash && (
                <HashBlock label="Hash del Bloque Anterior" value={acta.prev_hash} />
              )}
              {!acta.prev_hash && (
                <div className="rounded-md p-3 border border-dashed bg-muted/20 text-center">
                  <p className="text-[11px] font-mono text-muted-foreground">— Bloque Genesis — primer registro de la cadena</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* OCR result */}
          <Card className="border">
            <CardHeader className="py-3 px-4 border-b bg-muted/30 flex flex-row items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold">Resultado OCR</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {acta.ocr_result ? (
                <div className="bg-muted/30 border rounded-lg p-3 max-h-52 overflow-y-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap text-foreground leading-relaxed">{acta.ocr_result}</pre>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed bg-muted/20 py-8 text-center">
                  <p className="text-sm text-muted-foreground">Sin texto OCR extraido</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">
                    {acta.status === "inconsistent"
                      ? "No se detectaron numeros en la imagen"
                      : "El procesamiento OCR no produjo resultados"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status explanation */}
          <div className={cn(
            "rounded-lg border p-3 text-xs",
            acta.status === "valid" ? "bg-emerald-50 border-emerald-200" :
            acta.status === "suspicious" ? "bg-amber-50 border-amber-200" :
            "bg-red-50 border-red-200"
          )}>
            <p className={cn(
              "font-semibold mb-0.5",
              acta.status === "valid" ? "text-emerald-800" :
              acta.status === "suspicious" ? "text-amber-800" :
              "text-red-800"
            )}>
              {acta.status === "valid" && "Acta Valida — OCR exitoso con datos numericos detectados"}
              {acta.status === "suspicious" && "Acta Sospechosa — texto detectado pero incompleto o irregular"}
              {acta.status === "inconsistent" && "Acta Inconsistente — no se detectaron numeros validos"}
            </p>
            <p className={cn(
              acta.status === "valid" ? "text-emerald-700" :
              acta.status === "suspicious" ? "text-amber-700" :
              "text-red-700"
            )}>
              {acta.status === "valid" && "La imagen fue procesada correctamente. Los datos extraidos son consistentes con un formato de acta electoral."}
              {acta.status === "suspicious" && "Se recomienda revision manual. El texto extraido no cumple todos los criterios de un acta completa."}
              {acta.status === "inconsistent" && "La imagen no contiene informacion numerica valida. Puede ser ilegible, corrupta o de formato incorrecto."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
