import { useVerifyBlockchain, useListBlocks } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, ShieldAlert, Database, Link as LinkIcon, ArrowDown, Clock } from "lucide-react";
import { TruncatedHash } from "./dashboard";
import { cn } from "@/lib/utils";

export default function Blockchain() {
  const { data: verification, isLoading: verifyLoading } = useVerifyBlockchain();
  const { data: blocks, isLoading: blocksLoading } = useListBlocks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Verificacion de Cadena</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Auditoria criptografica del ledger electoral inmutable.
        </p>
      </div>

      {/* Verification status */}
      {verifyLoading ? (
        <Skeleton className="h-28 rounded-lg" />
      ) : verification ? (
        <div className={cn(
          "rounded-lg border p-5 flex items-start gap-4",
          verification.is_valid
            ? "bg-emerald-50 border-emerald-200"
            : "bg-red-50 border-red-200"
        )}>
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
            verification.is_valid ? "bg-emerald-100" : "bg-red-100"
          )}>
            {verification.is_valid
              ? <ShieldCheck className="w-6 h-6 text-emerald-600" />
              : <ShieldAlert className="w-6 h-6 text-red-600" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h2 className={cn("font-bold text-lg", verification.is_valid ? "text-emerald-800" : "text-red-800")}>
                {verification.is_valid ? "Cadena Integra" : "Cadena Comprometida"}
              </h2>
              <Badge className={cn(
                "text-[11px] font-semibold",
                verification.is_valid
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-red-100 text-red-700 border-red-200 hover:bg-red-100"
              )}>
                {verification.is_valid ? "VERIFICADA" : "ALERTA"}
              </Badge>
            </div>
            <p className={cn("text-sm", verification.is_valid ? "text-emerald-700" : "text-red-700")}>
              {verification.message}
            </p>
            {verification.broken_at_block && (
              <p className="text-xs font-mono mt-1 text-red-600">
                Fallo detectado en bloque: #{verification.broken_at_block}
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-bold font-mono text-foreground">{verification.block_count}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">bloques</p>
          </div>
        </div>
      ) : null}

      {/* Stats row */}
      {!blocksLoading && blocks && blocks.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total bloques", value: blocks.length, mono: true },
            { label: "Bloque genesis", value: `#${blocks[blocks.length - 1]?.id ?? "—"}`, mono: true },
            { label: "Ultimo bloque", value: `#${blocks[0]?.id ?? "—"}`, mono: true },
          ].map((s) => (
            <Card key={s.label} className="border">
              <CardContent className="py-3 px-4 text-center">
                <p className={cn("text-lg font-bold text-foreground", s.mono && "font-mono")}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Block list */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Bloques del Ledger</h2>
          {blocks && (
            <Badge variant="secondary" className="text-[11px] ml-1">{blocks.length}</Badge>
          )}
        </div>

        {blocksLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
          </div>
        ) : !blocks || blocks.length === 0 ? (
          <Card className="border">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              <Database className="w-8 h-8 mx-auto mb-3 opacity-25" />
              El ledger esta vacio. Sube un acta para crear el primer bloque.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-0">
            {blocks.map((block, index) => (
              <div key={block.id} data-testid={`block-card-${block.id}`}>
                <Card className={cn(
                  "border rounded-lg overflow-hidden transition-all hover:shadow-sm",
                  block.status === "valid" ? "border-l-2 border-l-emerald-400" :
                  block.status === "suspicious" ? "border-l-2 border-l-amber-400" :
                  "border-l-2 border-l-red-400"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Block number */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-md bg-muted border flex items-center justify-center">
                        <span className="text-xs font-bold font-mono text-muted-foreground">#{block.id}</span>
                      </div>

                      {/* Block data */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono font-semibold text-sm text-foreground">{block.mesa_id}</span>
                          <span className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                            block.status === "valid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            block.status === "suspicious" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-red-50 text-red-700 border-red-200"
                          )}>
                            {block.status === "valid" ? "Valida" : block.status === "suspicious" ? "Sospechosa" : "Inconsistente"}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
                            <Clock className="w-3 h-3" />
                            {new Date(block.timestamp).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                          <div>
                            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Block Hash</p>
                            <div className="bg-muted/40 rounded px-2 py-1.5 border">
                              <TruncatedHash hash={block.block_hash} length={20} />
                            </div>
                          </div>
                          <div>
                            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                              {block.prev_hash ? "Hash Anterior" : "Bloque Genesis"}
                            </p>
                            <div className="bg-muted/40 rounded px-2 py-1.5 border">
                              {block.prev_hash
                                ? <TruncatedHash hash={block.prev_hash} length={20} />
                                : <span className="font-mono text-[11px] text-muted-foreground/50 italic">— origen —</span>
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Chain link indicator */}
                {index < blocks.length - 1 && (
                  <div className="flex justify-center my-0.5">
                    <div className="flex flex-col items-center">
                      <ArrowDown className="w-3 h-3 text-border" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
