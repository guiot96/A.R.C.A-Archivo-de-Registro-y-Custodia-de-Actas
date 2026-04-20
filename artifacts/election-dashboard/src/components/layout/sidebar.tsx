import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import {
  LayoutDashboard, Upload, FileText, ShieldCheck, BookOpen,
  ChevronRight, X, Menu, Shield, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Panel", href: "/dashboard", icon: LayoutDashboard, label: "Estadísticas en tiempo real" },
  { name: "Subir Acta", href: "/upload", icon: Upload, label: "Registrar nuevo acta" },
  { name: "Actas", href: "/actas", icon: FileText, label: "Ver todos los registros" },
  { name: "Cadena", href: "/blockchain", icon: ShieldCheck, label: "Integridad del ledger" },
  { name: "Detección", href: "/detection", icon: Eye, label: "Análisis multi-modelo" },
  { name: "Blog", href: "/blog", icon: BookOpen, label: "Documentación del sistema" },
];

function NavLinks({ onClose }: { onClose?: () => void }) {
  const [location] = useLocation();
  return (
    <nav className="space-y-0.5 flex-1">
      {navigation.map((item) => {
        const isActive =
          location === item.href ||
          (item.href !== "/" && location.startsWith(item.href));
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onClose}
            className={cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
              isActive
                ? "bg-primary text-white shadow-sm"
                : "text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            )}
            data-testid={`nav-${item.href.replace("/", "")}`}
          >
            <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-white" : "text-sidebar-foreground/50")} />
            <div className="flex-1 min-w-0">
              <div className="truncate">{item.name}</div>
              {isActive && (
                <div className="text-[10px] text-white/60 truncate mt-0.5">{item.label}</div>
              )}
            </div>
            {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Flag stripe */}
      <div className="flex h-1 flex-shrink-0">
        <div className="flex-[2] bg-yellow-400" />
        <div className="flex-1 bg-blue-700" />
        <div className="flex-1 bg-red-600" />
      </div>

      {/* Brand */}
      <div className="px-5 pt-5 pb-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm text-sidebar-foreground tracking-tight">
                Integridad Electoral
              </span>
            </div>
            <p className="text-[10px] text-sidebar-foreground/40 font-mono pl-9 tracking-wide">COLOMBIA · SISTEMA ABIERTO</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-sidebar-foreground/50 hover:text-sidebar-foreground p-1 rounded-md hover:bg-sidebar-accent transition-colors md:hidden">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/35 px-3 mb-3">
          Navegación
        </p>
        <NavLinks onClose={onClose} />
      </div>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-sidebar-border pt-3">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent/50">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary/80">OE</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-sidebar-foreground truncate">Observador Electoral</div>
            <div className="text-[10px] font-mono text-sidebar-foreground/40">Acceso verificado</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BottomNav() {
  const [location] = useLocation();
  const items = navigation.slice(0, 5);
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-sidebar border-t border-sidebar-border md:hidden safe-area-bottom">
      <div className="flex">
        {items.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 pt-2.5 gap-0.5 text-[10px] font-medium transition-colors min-h-[56px]",
                isActive ? "text-primary" : "text-sidebar-foreground/40"
              )}
            >
              <item.icon className={cn("w-5 h-5 mb-0.5", isActive ? "text-primary" : "text-sidebar-foreground/40")} />
              <span className="truncate max-w-[48px] text-center">{item.name}</span>
              {isActive && <div className="w-1 h-1 rounded-full bg-primary absolute top-1.5" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close on route change
  const [location] = useLocation();
  useEffect(() => setMobileOpen(false), [location]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop sidebar */}
      <div className="w-64 flex-shrink-0 hidden md:flex flex-col border-r border-sidebar-border">
        <SidebarContent />
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="absolute left-0 top-0 bottom-0 w-72 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-14 flex items-center justify-between px-4 md:px-6 border-b bg-card shadow-xs flex-shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 -ml-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Mobile brand */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-sm text-foreground">Integridad Electoral</span>
            </div>
            {/* Desktop status */}
            <div className="hidden md:block text-sm text-muted-foreground">
              Sistema de Integridad Electoral —{" "}
              <span className="text-emerald-600 font-semibold font-mono text-xs">● EN LINEA</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span className="bg-muted border px-2 py-1 rounded text-[10px]">v1.0.0</span>
            <span className="hidden sm:inline text-[10px]">Open Source</span>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
