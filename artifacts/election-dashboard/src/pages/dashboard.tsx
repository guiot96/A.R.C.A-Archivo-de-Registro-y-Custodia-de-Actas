import { Link } from "wouter";
import { useGetDashboardStats, useListActas } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText, AlertTriangle, CheckCircle2, ShieldAlert,
  ArrowUpRight, Shield, Upload, Link as ChainIcon, TrendingUp
} from "lucide-react";

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "valid":
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 font-medium text-[11px] px-2 py-0.5">
          Valida
        </Badge>
      );
    case "suspicious":
      return (
        <Badge className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50 font-medium text-[11px] px-2 py-0.5">
          Sospechosa
        </Badge>
      );
    case "inconsistent":
      return (
        <Badge className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-50 font-medium text-[11px] px-2 py-0.5">
          Inconsistente
        </Badge>
      );
    default:
      return <Badge variant="outline" className="text-[11px]">{status}</Badge>;
  }
}

export function TruncatedHash({ hash, length = 14 }: { hash: string; length?: number }) {
  if (!hash) return <span className="text-muted-foreground">—</span>;
  return (
    <span
      className="font-mono text-[11px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/50"
      title={hash}
    >
      {hash.substring(0, length)}…
    </span>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: actas, isLoading: actasLoading } = useListActas();

  const total = stats?.total ?? 0;
  const validPct = total > 0 ? Math.round(((stats?.valid ?? 0) / total) * 100) : 0;

  return (
    <div className="space-y-5">

      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden min-h-[180px] md:min-h-[220px] bg-sidebar">
        {/* Background image */}
        <img
          src="/images/hero-dashboard.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-sidebar via-sidebar/80 to-transparent" />
        {/* Colombia flag stripe top */}
        <div className="absolute top-0 left-0 right-0 flex h-1">
          <div className="flex-[2] bg-yellow-400" />
          <div className="flex-1 bg-blue-700" />
          <div className="flex-1 bg-red-600" />
        </div>

        <div className="relative z-10 p-5 md:p-8 flex flex-col justify-between h-full min-h-[180px] md:min-h-[220px]">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1">
                <div className="w-4 h-2.5 bg-yellow-400 rounded-sm" />
                <div className="w-3 h-2.5 bg-blue-700 rounded-sm" />
                <div className="w-3 h-2.5 bg-red-600 rounded-sm" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/50">República de Colombia</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-1">
              Panel de Auditoría
            </h1>
            <p className="text-sm text-sidebar-foreground/70 max-w-xs">
              Verificación criptográfica de actas electorales en tiempo real.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Link href="/upload">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-md">
                <Upload className="w-3.5 h-3.5" />
                Subir acta
              </button>
            </Link>
            <Link href="/blockchain">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur text-white text-sm font-medium hover:bg-white/20 transition-colors border border-white/20">
                <ChainIcon className="w-3.5 h-3.5" />
                Verificar cadena
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Integrity score bar (when there's data) */}
      {!statsLoading && total > 0 && (
        <div className="rounded-xl border bg-card px-4 py-4 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${validPct >= 80 ? "bg-emerald-100" : validPct >= 50 ? "bg-amber-100" : "bg-red-100"}`}>
            <Shield className={`w-5 h-5 ${validPct >= 80 ? "text-emerald-600" : validPct >= 50 ? "text-amber-600" : "text-red-600"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-foreground">Índice de integridad</span>
              <span className={`text-sm font-bold font-mono ${validPct >= 80 ? "text-emerald-600" : validPct >= 50 ? "text-amber-600" : "text-red-600"}`}>{validPct}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${validPct >= 80 ? "bg-emerald-500" : validPct >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                style={{ width: `${validPct}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">{stats?.valid} de {total} actas sin inconsistencias</p>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total",
            value: stats?.total ?? 0,
            sub: "Procesadas",
            icon: FileText,
            color: "text-primary",
            bar: "bg-primary",
            bg: "bg-primary/8",
          },
          {
            label: "Válidas",
            value: stats?.valid ?? 0,
            sub: "OCR correcto",
            icon: CheckCircle2,
            color: "text-emerald-600",
            bar: "bg-emerald-500",
            bg: "bg-emerald-50",
            testId: "stat-valid",
          },
          {
            label: "Sospechosas",
            value: stats?.suspicious ?? 0,
            sub: "Revisión manual",
            icon: AlertTriangle,
            color: "text-amber-600",
            bar: "bg-amber-500",
            bg: "bg-amber-50",
            testId: "stat-suspicious",
          },
          {
            label: "Inconsistentes",
            value: stats?.inconsistent ?? 0,
            sub: "Error detectado",
            icon: ShieldAlert,
            color: "text-red-600",
            bar: "bg-red-500",
            bg: "bg-red-50",
            testId: "stat-inconsistent",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border shadow-xs hover:shadow-sm transition-shadow">
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-start justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                {!statsLoading && total > 0 && (
                  <span className={`text-[10px] font-bold font-mono ${stat.color}`}>
                    {Math.round(((stat.value) / total) * 100)}%
                  </span>
                )}
              </div>
              {statsLoading ? (
                <Skeleton className="h-7 w-12 mb-1" />
              ) : (
                <p className={`text-2xl font-bold ${stat.color}`} data-testid={stat.testId ?? `stat-${stat.label}`}>
                  {stat.value}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground/60">{stat.sub}</p>
              {!statsLoading && total > 0 && (
                <div className="mt-2.5 w-full h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${stat.bar}`}
                    style={{ width: `${Math.round(((stat.value) / total) * 100)}%` }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions (mobile-friendly) */}
      <div className="grid grid-cols-3 gap-3 md:hidden">
        {[
          { label: "Subir acta", href: "/upload", icon: Upload, color: "text-primary bg-primary/8" },
          { label: "Ver actas", href: "/actas", icon: FileText, color: "text-violet-600 bg-violet-50" },
          { label: "Cadena", href: "/blockchain", icon: ChainIcon, color: "text-emerald-600 bg-emerald-50" },
        ].map((a) => (
          <Link key={a.href} href={a.href}>
            <div className="border rounded-xl p-3 text-center bg-card hover:shadow-sm transition-all active:scale-95">
              <div className={`w-10 h-10 rounded-full ${a.color} flex items-center justify-center mx-auto mb-2`}>
                <a.icon className="w-5 h-5" />
              </div>
              <p className="text-[11px] font-medium text-foreground leading-tight">{a.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3 px-4 md:px-5 pt-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold text-foreground">Actividad Reciente</CardTitle>
            </div>
            <Link href="/actas">
              <button className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                Ver todas
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {actasLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : !actas || actas.length === 0 ? (
            <div className="py-14 text-center text-sm text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No hay actas registradas aún.</p>
              <Link href="/upload">
                <button className="mt-3 text-primary text-xs font-medium hover:underline">Subir primera acta</button>
              </Link>
            </div>
          ) : (
            <>
              {/* Mobile: card list */}
              <div className="divide-y md:hidden">
                {actas.slice(0, 5).map((acta) => (
                  <Link key={acta.id} href={`/actas/${acta.id}`}>
                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors active:bg-muted/40">
                      <div className={`w-2 h-8 rounded-full flex-shrink-0 ${acta.status === "valid" ? "bg-emerald-400" : acta.status === "suspicious" ? "bg-amber-400" : "bg-red-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono font-semibold text-sm text-foreground truncate">{acta.mesa_id}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {acta.departamento ? `${acta.departamento}` : "Sin ubicación"} · {new Date(acta.timestamp).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                        </p>
                      </div>
                      <StatusBadge status={acta.status} />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b">
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-5">Mesa</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Departamento</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Estado</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Block Hash</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right px-5">Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {actas.slice(0, 6).map((acta) => (
                      <TableRow key={acta.id} className="hover:bg-muted/30 transition-colors" data-testid={`row-acta-${acta.id}`}>
                        <TableCell className="font-mono text-sm font-medium px-5 py-3">{acta.mesa_id}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {acta.departamento ? `${acta.departamento}${acta.municipio ? ` / ${acta.municipio}` : ""}` : <span className="text-muted-foreground/40">—</span>}
                        </TableCell>
                        <TableCell className="py-3"><StatusBadge status={acta.status} /></TableCell>
                        <TableCell className="py-3"><TruncatedHash hash={acta.block_hash} /></TableCell>
                        <TableCell className="text-right text-[11px] text-muted-foreground px-5 py-3 whitespace-nowrap">
                          {new Date(acta.timestamp).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
