import { useState } from "react";
import { Link } from "wouter";
import { useListActas } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Search, FileText, MapPin, Hash, Upload } from "lucide-react";
import { StatusBadge, TruncatedHash } from "./dashboard";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "valid" | "suspicious" | "inconsistent";

export default function Actas() {
  const { data: actas, isLoading } = useListActas();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = actas?.filter((a) => {
    const matchSearch =
      !search ||
      a.mesa_id.toLowerCase().includes(search.toLowerCase()) ||
      (a.departamento ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (a.municipio ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: actas?.length ?? 0,
    valid: actas?.filter((a) => a.status === "valid").length ?? 0,
    suspicious: actas?.filter((a) => a.status === "suspicious").length ?? 0,
    inconsistent: actas?.filter((a) => a.status === "inconsistent").length ?? 0,
  };

  const filterOptions: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "Todas", count: counts.all },
    { key: "valid", label: "Validas", count: counts.valid },
    { key: "suspicious", label: "Sospechosas", count: counts.suspicious },
    { key: "inconsistent", label: "Inconsistentes", count: counts.inconsistent },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Actas Registradas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {actas?.length ?? 0} registros en el ledger electoral
          </p>
        </div>
        <Link href="/upload">
          <Button size="sm" className="flex-shrink-0" data-testid="link-new-acta">
            <Upload className="w-3.5 h-3.5 mr-2" />
            Subir acta
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por mesa, departamento, municipio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 text-sm"
            data-testid="input-search"
          />
        </div>
        <div className="flex rounded-md border bg-card overflow-hidden h-8 flex-shrink-0">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setStatusFilter(opt.key)}
              className={cn(
                "px-3 text-xs font-medium transition-colors border-r last:border-r-0 flex items-center gap-1.5",
                statusFilter === opt.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              data-testid={`filter-${opt.key}`}
            >
              {opt.label}
              <span className={cn(
                "text-[10px] rounded-full px-1.5 py-0.5 font-mono",
                statusFilter === opt.key ? "bg-white/20" : "bg-muted"
              )}>
                {opt.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-36 rounded-lg" />)}
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <Card className="border">
          <CardContent className="py-14 text-center">
            <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">
              {search || statusFilter !== "all" ? "Sin resultados para este filtro" : "No hay actas registradas aun"}
            </p>
            {!search && statusFilter === "all" && (
              <Link href="/upload">
                <button className="mt-3 text-primary text-sm font-medium hover:underline">
                  Subir primera acta
                </button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((acta) => (
            <Card
              key={acta.id}
              className="border hover:shadow-sm transition-all duration-150 overflow-hidden group"
              data-testid={`card-acta-${acta.id}`}
            >
              <div className={cn(
                "h-1 w-full",
                acta.status === "valid" ? "bg-emerald-400" : acta.status === "suspicious" ? "bg-amber-400" : "bg-red-400"
              )} />
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono font-bold text-sm text-foreground truncate">{acta.mesa_id}</span>
                      <StatusBadge status={acta.status} />
                    </div>
                    {(acta.departamento || acta.municipio) && (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">
                          {[acta.departamento, acta.municipio].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded border flex-shrink-0">
                    <span className="font-mono">#{acta.id}</span>
                  </div>
                </div>

                {/* Image preview */}
                <div className="relative h-24 bg-muted rounded-md overflow-hidden border">
                  <img
                    src={`/api/actas/${acta.id}/image`}
                    alt={`Acta ${acta.mesa_id}`}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    data-testid={`img-preview-${acta.id}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Hash and meta */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Hash className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <TruncatedHash hash={acta.image_hash} length={12} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(acta.timestamp).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                    <Link href={`/actas/${acta.id}`}>
                      <Button variant="outline" size="sm" className="h-6 px-2 text-[11px]" data-testid={`btn-view-${acta.id}`}>
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
