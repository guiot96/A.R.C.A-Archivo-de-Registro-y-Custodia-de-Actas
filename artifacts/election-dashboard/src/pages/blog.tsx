import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Hash, ScanText, Link as LinkIcon, ShieldCheck, MapPin,
  ChevronDown, AlertTriangle, CheckCircle2, BookOpen,
  Users, Brain, Layers, Globe, TrendingUp, DollarSign,
  Building2, Zap, RefreshCw, Shield
} from "lucide-react";

type Article = {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  tag: string;
  title: string;
  summary: string;
  content: React.ReactNode;
};

const articles: Article[] = [
  {
    id: "problema",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50 border-amber-200",
    tag: "Contexto",
    title: "El problema: fraude electoral y falta de transparencia",
    summary:
      "Las actas electorales en papel son el registro definitivo de los votos. Cuando se manipulan, no hay forma fácil de detectarlo.",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
        <p>
          En los procesos electorales de Colombia, cada mesa de votación produce un <strong className="text-foreground">acta de escrutinio</strong> —un documento físico firmado por testigos y jurados que certifica la cantidad de votos obtenidos por cada candidato. Este documento es la fuente de verdad del sistema democrático.
        </p>
        <p>
          Sin embargo, en el camino entre la mesa de votación y los centros de cómputo, estas actas pueden ser alteradas, extraviadas o reemplazadas. En elecciones pasadas, organizaciones como la <strong className="text-foreground">Misión de Observación Electoral (MOE)</strong> y la <strong className="text-foreground">Registraduría Nacional</strong> han documentado inconsistencias que no pudieron ser explicadas completamente.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="font-semibold text-amber-800 mb-1">Vulnerabilidades identificadas</p>
          <ul className="list-disc pl-4 space-y-1 text-amber-700 text-sm">
            <li>Sustitución o alteración del acta física antes de la digitalización</li>
            <li>Errores de transcripción intencionales o accidentales al ingresar datos al sistema</li>
            <li>Actas con firmas ausentes o ilegibles que dificultan la validación</li>
            <li>Falta de trazabilidad: no hay forma de saber si la imagen digital fue modificada</li>
          </ul>
        </div>
        <p>
          Este sistema busca resolver exactamente eso: proporcionar una <strong className="text-foreground">cadena de custodia digital inmutable</strong> desde el momento en que el acta es fotografiada.
        </p>
      </div>
    ),
  },
  {
    id: "hash",
    icon: Hash,
    iconColor: "text-primary",
    iconBg: "bg-primary/8 border-primary/20",
    tag: "Criptografía",
    title: "SHA-256: la huella digital de cada acta",
    summary:
      "SHA-256 produce una cadena única de 64 caracteres para cualquier archivo. Cambiar un solo píxel cambia completamente el hash.",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
        <p>
          Cuando subes una imagen de acta, el sistema calcula su <strong className="text-foreground">hash SHA-256</strong> — una función criptográfica que convierte cualquier archivo, sin importar su tamaño, en una cadena de exactamente 64 caracteres hexadecimales.
        </p>
        <div className="bg-muted/50 border rounded-lg p-4 font-mono text-xs break-all">
          <p className="text-muted-foreground mb-1 font-sans text-[10px] uppercase tracking-widest font-semibold">Ejemplo de hash SHA-256</p>
          <p className="text-primary/90">a3f8c2d91e7b4056f82c19d347e08a1c6bbd4f2e90c53178de641a0b9278f4e1</p>
        </div>
        <p>
          La propiedad crítica de SHA-256 es su <strong className="text-foreground">efecto avalancha</strong>: un cambio mínimo en el archivo de entrada —incluso un solo bit— produce un hash completamente diferente. Esto significa que:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-foreground/75">
          <li>Si alguien modifica la imagen del acta, el hash cambia inmediatamente.</li>
          <li>Es computacionalmente imposible crear dos archivos distintos con el mismo hash.</li>
          <li>El hash puede ser recalculado por cualquier persona para verificar autenticidad.</li>
        </ul>
        <div className="bg-primary/5 border border-primary/15 rounded-lg p-4">
          <p className="font-semibold text-primary mb-1 text-sm">¿Cómo lo usa este sistema?</p>
          <p className="text-primary/80 text-sm">
            Al subir una imagen, el servidor calcula su SHA-256 antes de guardarla. Este hash queda registrado de forma permanente en la base de datos y se encadena al bloque. Si en el futuro alguien presenta la misma imagen pero con datos alterados, el hash no coincidirá — evidencia irrefutable de manipulación.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "ocr",
    icon: ScanText,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50 border-violet-200",
    tag: "Inteligencia Artificial",
    title: "OCR con Tesseract: extracción automática de votos",
    summary:
      "El motor OCR convierte la imagen en texto legible y detecta patrones numéricos para clasificar automáticamente el acta.",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
        <p>
          OCR significa <strong className="text-foreground">Optical Character Recognition</strong> (Reconocimiento Óptico de Caracteres). Este sistema usa <strong className="text-foreground">Tesseract.js</strong>, el motor OCR de código abierto originalmente desarrollado por HP y ahora mantenido por Google, ejecutado directamente en el servidor Node.js.
        </p>
        <p>
          Al procesar cada acta, el motor OCR lee la imagen y extrae todo el texto visible. Después, el sistema analiza ese texto buscando patrones numéricos que indiquen la presencia de conteos de votos.
        </p>

        <div className="grid grid-cols-3 gap-2">
          {[
            { status: "Valida", color: "emerald", desc: "Se detectaron números: el acta contiene datos numéricos legibles" },
            { status: "Sospechosa", color: "amber", desc: "Texto incompleto: se extrajo texto pero sin suficientes datos numéricos" },
            { status: "Inconsistente", color: "red", desc: "Sin datos: la imagen no contiene números legibles por el OCR" },
          ].map((s) => (
            <div key={s.status} className={`rounded-lg border p-3 bg-${s.color}-50 border-${s.color}-200`}>
              <p className={`font-semibold text-${s.color}-700 text-xs mb-1`}>{s.status}</p>
              <p className={`text-${s.color}-600 text-[11px] leading-snug`}>{s.desc}</p>
            </div>
          ))}
        </div>

        <p>
          Es importante entender las <strong className="text-foreground">limitaciones del OCR</strong>: si el acta está escrita a mano con letra ilegible, está muy manchada o la fotografía tiene poca iluminación, el motor puede no extraer el texto correctamente. En esos casos, el acta se marca como sospechosa o inconsistente, y se recomienda revisión manual.
        </p>
        <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
          <p className="font-semibold text-violet-800 mb-1 text-sm">El OCR no es el juez final</p>
          <p className="text-violet-700 text-sm">
            El estado del acta (válida / sospechosa / inconsistente) refleja la calidad de la imagen y la legibilidad del OCR, no necesariamente si el acta fue manipulada. Una acta puede ser válida en cuanto a integridad de imagen y aún contener datos incorrectos escritos a mano. Por eso este sistema es una herramienta de <em>apoyo</em> a la auditoría humana, no un reemplazo.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "blockchain",
    icon: LinkIcon,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50 border-emerald-200",
    tag: "Ledger Inmutable",
    title: "Blockchain sin monedas: el ledger electoral",
    summary:
      "Cada acta forma un bloque encadenado al anterior mediante hashes. Alterar cualquier bloque rompe toda la cadena.",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
        <p>
          El término <strong className="text-foreground">"blockchain"</strong> evoca criptomonedas, pero su principio fundamental es mucho más simple y poderoso: un <strong className="text-foreground">registro donde cada entrada depende matemáticamente de la anterior</strong>.
        </p>
        <p>
          En este sistema, cuando se registra una acta, se calcula su <strong className="text-foreground">block hash</strong> combinando tres elementos:
        </p>

        <div className="bg-muted/50 border rounded-lg p-4 font-mono text-xs space-y-2">
          <p className="text-muted-foreground font-sans text-[10px] uppercase tracking-widest font-semibold mb-2">Fórmula del block hash</p>
          <p><span className="text-primary">block_hash</span> = <span className="text-emerald-600">SHA256</span>(</p>
          <p className="pl-4"><span className="text-amber-600">prev_block_hash</span>  <span className="text-muted-foreground">← hash del bloque anterior</span></p>
          <p className="pl-4">+ <span className="text-violet-600">image_hash</span>       <span className="text-muted-foreground">← SHA256 de la imagen</span></p>
          <p className="pl-4">+ <span className="text-foreground">timestamp</span>        <span className="text-muted-foreground">← marca de tiempo</span></p>
          <p>)</p>
        </div>

        <p>
          El resultado: cada bloque contiene dentro de sí la huella del bloque anterior. Esto crea una cadena donde <strong className="text-foreground">modificar cualquier registro pasado invalida todos los bloques posteriores</strong>. La función "Verificar Cadena" recalcula todos los hashes y detecta cualquier ruptura.
        </p>

        <div className="space-y-2">
          <p className="font-semibold text-foreground text-sm">Diferencias con Bitcoin</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-2 border border-border font-semibold text-foreground">Característica</th>
                  <th className="text-left p-2 border border-border font-semibold text-primary">Este sistema</th>
                  <th className="text-left p-2 border border-border font-semibold text-muted-foreground">Bitcoin</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Nodos", "Servidor central (PostgreSQL)", "Miles de nodos distribuidos"],
                  ["Consenso", "No requerido (single authority)", "Prueba de trabajo (PoW)"],
                  ["Tokens/monedas", "Ninguno", "Bitcoin (BTC)"],
                  ["Propósito", "Integridad de registros electorales", "Moneda digital descentralizada"],
                  ["Velocidad", "Inmediata", "~10 minutos por bloque"],
                ].map(([feature, ours, bitcoin]) => (
                  <tr key={feature} className="hover:bg-muted/20">
                    <td className="p-2 border border-border font-medium text-foreground">{feature}</td>
                    <td className="p-2 border border-border text-primary/80">{ours}</td>
                    <td className="p-2 border border-border text-muted-foreground">{bitcoin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p className="font-semibold text-emerald-800 mb-1 text-sm">Código abierto y auditable</p>
          <p className="text-emerald-700 text-sm">
            Todo el código de este sistema — incluyendo la lógica de encadenamiento — es de código abierto. Cualquier técnico puede revisar, clonar y ejecutar independientemente la verificación de la cadena. La transparencia del código es tan importante como la transparencia de los datos.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "colombia",
    icon: MapPin,
    iconColor: "text-red-600",
    iconBg: "bg-red-50 border-red-200",
    tag: "Contexto Colombia",
    title: "Colombia: departamentos, municipios y mesas electorales",
    summary:
      "Colombia tiene 32 departamentos, más de 1.100 municipios y miles de mesas de votación. Este sistema está diseñado para escalar a ese nivel.",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
        <p>
          El sistema electoral colombiano está organizado en una jerarquía de tres niveles: <strong className="text-foreground">Departamento → Municipio → Mesa de votación</strong>. Cada mesa produce un acta independiente firmada por los jurados presentes.
        </p>

        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { num: "33", label: "Departamentos", sub: "incluye Bogotá D.C." },
            { num: "1.122", label: "Municipios", sub: "aprox." },
            { num: "~100K", label: "Mesas activas", sub: "en elecciones presidenciales" },
          ].map((s) => (
            <div key={s.label} className="border rounded-lg p-3 bg-card">
              <p className="text-xl font-bold text-primary font-mono">{s.num}</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">{s.label}</p>
              <p className="text-[10px] text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </div>

        <p>
          Al registrar un acta en este sistema, se puede especificar el <strong className="text-foreground">departamento</strong> y el <strong className="text-foreground">municipio</strong> correspondiente. Esto permite filtrar, agrupar y detectar anomalías por región geográfica — por ejemplo, identificar si un municipio específico tiene una tasa de actas inconsistentes inusualmente alta.
        </p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="font-semibold text-red-800 mb-1 text-sm">Marco legal relevante</p>
          <ul className="list-disc pl-4 space-y-1 text-red-700 text-sm">
            <li>Artículo 258 de la Constitución Política de Colombia: garantías del voto</li>
            <li>Código Electoral (Ley 2094 de 2021): modernización del proceso electoral</li>
            <li>Resolución de la Registraduría sobre custodia de documentos electorales</li>
          </ul>
        </div>

        <p>
          La información de ubicación en este sistema es <strong className="text-foreground">opcional pero valiosa</strong>: no afecta la integridad criptográfica del acta, pero enriquece enormemente las capacidades analíticas del sistema para detectar patrones geográficos de irregularidades.
        </p>
      </div>
    ),
  },
  {
    id: "arquitectura",
    icon: ShieldCheck,
    iconColor: "text-primary",
    iconBg: "bg-primary/8 border-primary/20",
    tag: "Arquitectura técnica",
    title: "Cómo está construido: stack técnico y decisiones de diseño",
    summary:
      "Un servidor Express 5, base de datos PostgreSQL, OCR en Node.js y una interfaz React — todo de código abierto.",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
        <p>
          El sistema está construido sobre tecnologías de código abierto ampliamente probadas, con énfasis en <strong className="text-foreground">auditabilidad, rendimiento y simplicidad</strong>.
        </p>

        <div className="space-y-2">
          {[
            {
              layer: "Frontend",
              tech: "React 19 + Vite + Tailwind CSS",
              desc: "Interfaz de usuario interactiva, construida con componentes reutilizables. El cliente generado automáticamente desde la especificación OpenAPI garantiza que el frontend siempre esté sincronizado con el backend.",
              color: "blue",
            },
            {
              layer: "Backend",
              tech: "Express 5 + Node.js + TypeScript",
              desc: "Servidor HTTP con rutas tipadas. Maneja la recepción de imágenes con Multer, el procesamiento OCR con Tesseract.js, el cálculo SHA-256 nativo de Node.js, y la lógica de encadenamiento.",
              color: "purple",
            },
            {
              layer: "Base de datos",
              tech: "PostgreSQL + Drizzle ORM",
              desc: "Almacenamiento persistente y transaccional de todos los registros. Drizzle ORM garantiza que el schema de la base de datos esté tipado y versionado en código.",
              color: "emerald",
            },
            {
              layer: "OCR",
              tech: "Tesseract.js",
              desc: "Motor OCR de código abierto ejecutado en el servidor. No requiere servicios externos de pago, funciona completamente offline, y soporta español (es_CO) para mejor reconocimiento de texto.",
              color: "violet",
            },
            {
              layer: "Seguridad",
              tech: "SHA-256 nativo (crypto module de Node)",
              desc: "Sin dependencias externas para el hashing. El módulo crypto de Node.js implementa SHA-256 conforme a FIPS 180-4, el estándar federal de EE.UU. para funciones hash.",
              color: "amber",
            },
          ].map((item) => (
            <div key={item.layer} className="border rounded-lg p-4 bg-card">
              <div className="flex items-start gap-3">
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-${item.color}-50 text-${item.color}-700 border border-${item.color}-200 flex-shrink-0 mt-0.5`}>
                  {item.layer}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm mb-0.5 font-mono">{item.tech}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-muted/40 border rounded-lg p-4">
          <p className="font-semibold text-foreground mb-2 text-sm">Flujo completo al subir un acta</p>
          <ol className="space-y-2">
            {[
              "El observador fotografía el acta y lo sube a través del formulario web",
              "Multer recibe el archivo y lo guarda temporalmente en el servidor",
              "El módulo crypto de Node.js calcula el SHA-256 de la imagen",
              "Tesseract.js procesa la imagen y extrae texto en español",
              "El sistema analiza el texto: ¿contiene números? → clasifica el estado",
              "Se recupera el block_hash del registro anterior de la base de datos",
              "Se calcula el nuevo block_hash: SHA256(prev_hash + image_hash + timestamp)",
              "Todo se guarda atómicamente en PostgreSQL",
              "La respuesta incluye el nuevo acta con su block_hash",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-xs text-muted-foreground leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    ),
  },
  {
    id: "vision",
    icon: Globe,
    iconColor: "text-primary",
    iconBg: "bg-primary/8 border-primary/20",
    tag: "Visión del sistema",
    title: "Sistema de Verificación Abierta: IA + comunidad + blockchain + SaaS",
    summary:
      "Una capa de verificación independiente que convierte datos públicos en datos verificables, combinando inteligencia artificial, revisión humana y registro inmutable.",
    content: (
      <div className="space-y-8 text-sm leading-relaxed text-foreground/80">

        {/* 1. Contexto */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <h3 className="font-bold text-foreground text-sm">1. Contexto real: por qué existe este sistema</h3>
          </div>
          <p>
            En Colombia y en gran parte de Latinoamérica, los sistemas de información pública funcionan a gran escala pero con una característica constante: <strong className="text-foreground">los datos existen, pero no siempre son fácilmente verificables por cualquier ciudadano en tiempo real</strong>. Esto no es un problema puntual — es estructural.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/40 border rounded-lg p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Escala del proceso electoral</p>
              {[
                "~13.000 a 14.000 puestos de votación",
                "más de 100.000 mesas en elecciones nacionales",
                "cientos de miles de jurados ciudadanos",
                "zonas urbanas y rurales simultáneas",
                "millones de datos generados en pocas horas",
              ].map((item) => (
                <div key={item} className="flex items-start gap-1.5 text-[11px]">
                  <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Patrones de falla recurrentes</p>
              {[
                "diferencias entre actas físicas y datos digitales",
                "errores humanos en transcripción",
                "falta de trazabilidad de cambios",
                "dificultad de auditoría en tiempo real",
                "baja percepción de transparencia",
              ].map((item) => (
                <div key={item} className="flex items-start gap-1.5 text-[11px] text-amber-800">
                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-foreground/5 border rounded-lg p-4 text-center">
            <p className="font-bold text-foreground text-sm">Problema central</p>
            <p className="text-muted-foreground text-xs mt-1">
              La información pública no está diseñada para ser verificada de forma abierta, simultánea y trazable por cualquier persona.
            </p>
          </div>
        </section>

        {/* 2. Qué es */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Layers className="w-4 h-4 text-primary flex-shrink-0" />
            <h3 className="font-bold text-foreground text-sm">2. Qué es este sistema</h3>
          </div>
          <p>
            Este sistema es una <strong className="text-foreground">capa de verificación independiente</strong> que se coloca encima de cualquier flujo de datos públicos. No reemplaza nada existente — lo complementa.
          </p>
          <div className="bg-primary/5 border border-primary/15 rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-primary mb-1">convertir datos públicos</p>
            <p className="text-lg text-foreground">en datos verificables</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {[
              { label: "Analizada por IA", icon: Brain, color: "text-violet-600" },
              { label: "Revisada por personas reales", icon: Users, color: "text-emerald-600" },
              { label: "Registrada de forma inmutable", icon: Shield, color: "text-primary" },
              { label: "Consultable por cualquier ciudadano", icon: Globe, color: "text-amber-600" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 border rounded-lg p-2.5 bg-card">
                <item.icon className={`w-4 h-4 flex-shrink-0 ${item.color}`} />
                <span className="font-medium text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Cómo funciona — ciclo */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <RefreshCw className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <h3 className="font-bold text-foreground text-sm">3. Cómo funciona: el ciclo completo</h3>
          </div>
          <div className="space-y-1.5">
            {[
              { n: "01", step: "Entrada de datos", desc: "Imagen del acta o documento público" },
              { n: "02", step: "Análisis automático con IA", desc: "OCR, extracción, detección de anomalías" },
              { n: "03", step: "Detección de inconsistencias", desc: "Comparación aritmética y lógica" },
              { n: "04", step: "Clasificación de confianza", desc: "Consistente / Dudoso / Inconsistente" },
              { n: "05", step: "Revisión humana colaborativa", desc: "Red de auditores ciudadanos" },
              { n: "06", step: "Validación o corrección", desc: "Decisión con contexto humano" },
              { n: "07", step: "Registro inmutable", desc: "Block hash en el ledger PostgreSQL" },
              { n: "08", step: "Publicación pública", desc: "Datos abiertos auditables por cualquiera" },
            ].map((s, i) => (
              <div key={s.n} className="flex items-start gap-3">
                <div className="flex flex-col items-center flex-shrink-0">
                  <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold font-mono">{s.n}</span>
                  {i < 7 && <div className="w-0.5 h-4 bg-border mt-0.5" />}
                </div>
                <div className="pb-1">
                  <p className="font-semibold text-foreground text-xs">{s.step}</p>
                  <p className="text-[11px] text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4–6. Las 3 capas */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Brain className="w-4 h-4 text-violet-600 flex-shrink-0" />
            <h3 className="font-bold text-foreground text-sm">4–6. Las tres capas del sistema</h3>
          </div>

          {[
            {
              num: "Capa 1",
              label: "Inteligencia Artificial",
              color: "violet",
              icon: Brain,
              funciones: [
                "Lee imágenes y documentos (OCR)",
                "Extrae texto y números no estructurados",
                "Detecta errores aritméticos o lógicos",
                "Encuentra inconsistencias internas",
                "Identifica patrones anómalos",
              ],
              result: [
                { icon: "✔️", label: "Consistente" },
                { icon: "⚠️", label: "Dudoso" },
                { icon: "❌", label: "Inconsistente" },
              ],
              principio: "La IA no decide la verdad. La IA no elimina datos. La IA solo prioriza la revisión.",
            },
            {
              num: "Capa 2",
              label: "Verificación humana",
              color: "emerald",
              icon: Users,
              funciones: [
                "Revisa casos marcados por la IA",
                "Valida o corrige datos con criterio humano",
                "Agrega contexto que la IA no entiende",
                "Confirma o rechaza alertas automatizadas",
                "Detecta manipulación deliberada",
              ],
              result: [
                { icon: "👥", label: "Auditores ciudadanos" },
                { icon: "🔍", label: "Analistas independientes" },
                { icon: "💻", label: "Desarrolladores" },
              ],
              principio: "La IA detecta, el humano interpreta.",
            },
            {
              num: "Capa 3",
              label: "Blockchain / Registro inmutable",
              color: "primary",
              icon: Shield,
              funciones: [
                "Datos originales del acta",
                "Resultado del análisis de IA",
                "Decisión de revisión humana",
                "Historial completo de cambios",
                "Block hash encadenado",
              ],
              result: [
                { icon: "🔒", label: "No modificable sin evidencia" },
                { icon: "📋", label: "Trazabilidad completa" },
                { icon: "🌍", label: "Auditable por cualquiera" },
              ],
              principio: "La confianza se reemplaza por evidencia verificable.",
            },
          ].map((layer) => (
            <div key={layer.num} className={`border rounded-xl overflow-hidden`}>
              <div className={`px-4 py-3 flex items-center gap-3 bg-${layer.color === "primary" ? "primary" : layer.color + "-600"}/10 border-b`}>
                <layer.icon className={`w-4 h-4 text-${layer.color === "primary" ? "primary" : layer.color + "-600"}`} />
                <span className="font-bold text-foreground text-sm">{layer.num} — {layer.label}</span>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Funciones</p>
                  <ul className="space-y-1">
                    {layer.funciones.map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Resultado</p>
                  <div className="space-y-1.5">
                    {layer.result.map((r) => (
                      <div key={r.label} className="flex items-center gap-2 text-[11px] bg-muted/30 rounded px-2 py-1.5 border">
                        <span>{r.icon}</span>
                        <span className="font-medium text-foreground">{r.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4">
                <div className={`rounded-lg bg-${layer.color === "primary" ? "primary" : layer.color + "-50"}/30 border px-3 py-2 text-[11px] font-semibold text-foreground italic text-center`}>
                  "{layer.principio}"
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* 7. Doble verificación */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Zap className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <h3 className="font-bold text-foreground text-sm">7. Doble verificación — núcleo del sistema</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-xl p-4 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center mx-auto">
                <Brain className="w-5 h-5 text-violet-600" />
              </div>
              <p className="font-bold text-foreground text-sm">IA</p>
              {["Velocidad", "Análisis masivo", "Detección de patrones"].map((f) => (
                <p key={f} className="text-[11px] text-muted-foreground">{f}</p>
              ))}
            </div>
            <div className="border rounded-xl p-4 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="font-bold text-foreground text-sm">Humanos</p>
              {["Criterio", "Contexto", "Validación final"].map((f) => (
                <p key={f} className="text-[11px] text-muted-foreground">{f}</p>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {["Menos errores", "Mayor transparencia", "Decisiones más robustas"].map((r) => (
              <div key={r} className="bg-emerald-50 border border-emerald-200 rounded-lg py-2 px-3 text-[11px] font-semibold text-emerald-700">{r}</div>
            ))}
          </div>
        </section>

        {/* 8. Sistema regenerativo */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <RefreshCw className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <h3 className="font-bold text-foreground text-sm">8. Sistema regenerativo — aprende continuamente</h3>
          </div>
          <p>El sistema no es estático. Con cada interacción humana y cada corrección, la IA mejora su capacidad de detección.</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-lg p-3 bg-card space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Aprende de</p>
              {["Errores anteriores", "Correcciones humanas", "Nuevos patrones detectados", "Casos históricos acumulados"].map((f) => (
                <div key={f} className="flex items-center gap-1.5 text-[11px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <div className="border rounded-lg p-3 bg-card space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Evoluciona en</p>
              {["Precisión del análisis IA", "Velocidad de procesamiento", "Calidad de detección", "Reducción de falsos positivos"].map((f) => (
                <div key={f} className="flex items-center gap-1.5 text-[11px]">
                  <TrendingUp className="w-3 h-3 text-primary flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 10. Modelo económico */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <DollarSign className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <h3 className="font-bold text-foreground text-sm">10. Modelo del sistema: Open Source → Freemium → SaaS</h3>
          </div>

          <div className="space-y-3">
            {/* Open Source */}
            <div className="border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-muted/40 border-b flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">🆓 Open Source — base libre</span>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4 text-[11px]">
                <div>
                  <p className="font-semibold text-foreground mb-1.5">Incluye</p>
                  {["Código fuente abierto", "Verificación básica de actas", "Acceso a datos públicos", "Transparencia total", "Auditoría comunitaria"].map((f) => (
                    <div key={f} className="flex items-center gap-1.5 py-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1.5">Objetivo</p>
                  {["Generar confianza pública", "Adopción masiva ciudadana", "Legitimidad sin barreras"].map((f) => (
                    <div key={f} className="flex items-center gap-1.5 py-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Freemium */}
            <div className="border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800">🔓 Freemium — capacidades avanzadas</span>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4 text-[11px]">
                <div>
                  <p className="font-semibold text-foreground mb-1.5">Gratis</p>
                  {["Dashboards básicos", "Visualización de datos", "Análisis simple"].map((f) => (
                    <div key={f} className="flex items-center gap-1.5 py-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1.5">De pago</p>
                  {["Alertas avanzadas", "Análisis histórico profundo", "Comparación de datasets", "Exportación de reportes"].map((f) => (
                    <div key={f} className="flex items-center gap-1.5 py-0.5">
                      <DollarSign className="w-3 h-3 text-amber-600 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SaaS */}
            <div className="border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-primary text-white flex items-center gap-2">
                <span className="text-xs font-bold">💎 SaaS — Software as a Service</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {["IA avanzada de análisis", "Dashboards en tiempo real", "Mapas de riesgo y anomalías", "Reportes automáticos", "APIs de integración", "Monitoreo continuo"].map((f) => (
                    <div key={f} className="flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-primary flex-shrink-0" />
                      <span className="text-foreground/80">{f}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Estructura de precios</p>
                  <div className="space-y-2">
                    {[
                      { tier: "Básico", price: "50 – 200 USD/mes", features: "Dashboards simples, análisis básico", color: "emerald" },
                      { tier: "Profesional", price: "300 – 1.500 USD/mes", features: "IA avanzada, mapas interactivos, reportes", color: "amber" },
                      { tier: "Institucional", price: "5.000 – 50.000 USD/mes", features: "Infraestructura dedicada, soporte continuo, IA en tiempo real", color: "red" },
                      { tier: "Escala nacional", price: "100.000 – 500.000+ USD/mes", features: "Sistema completo, IA personalizada, alta disponibilidad", color: "primary" },
                    ].map((t) => (
                      <div key={t.tier} className={`flex items-start gap-3 border rounded-lg p-3 bg-${t.color === "primary" ? "primary/5" : t.color + "-50/50"}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-foreground text-xs">{t.tier}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{t.features}</p>
                        </div>
                        <span className={`font-mono text-xs font-bold flex-shrink-0 text-${t.color === "primary" ? "primary" : t.color + "-700"}`}>{t.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 11. Fundación */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
            <h3 className="font-bold text-foreground text-sm">11. Fundación de Transparencia</h3>
          </div>
          <p>Se propone una entidad independiente que proteja el sistema, mantenga su neutralidad y garantice continuidad.</p>
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="bg-card border rounded-lg p-3 space-y-1.5">
              <p className="font-semibold text-foreground text-xs mb-2">Funciones</p>
              {["Proteger el sistema de captura política", "Mantener neutralidad institucional", "Evitar manipulación de datos", "Asegurar continuidad operativa"].map((f) => (
                <div key={f} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1.5">
              <p className="font-semibold text-red-800 text-xs mb-2">La Fundación NO</p>
              {["No controla los datos", "No modifica resultados", "No interviene en verificaciones", "No representa intereses políticos"].map((f) => (
                <div key={f} className="flex items-start gap-1.5 text-red-700">
                  <span className="flex-shrink-0 font-bold">✕</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 12. Equipo */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Users className="w-4 h-4 text-primary flex-shrink-0" />
            <h3 className="font-bold text-foreground text-sm">12. Equipo necesario</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {[
              { area: "Tecnología", roles: ["Ingenieros de software", "Ingenieros de IA", "Data engineers", "DevOps"], color: "primary" },
              { area: "Producto", roles: ["UX/UI designers", "Product managers"], color: "violet" },
              { area: "Seguridad", roles: ["Ciberseguridad", "Auditores técnicos"], color: "red" },
              { area: "Operaciones y Legal", roles: ["Soporte", "Coordinación comunidad", "Compliance", "Gobernanza"], color: "amber" },
            ].map((area) => (
              <div key={area.area} className="border rounded-lg p-3 bg-card">
                <p className={`text-[10px] font-bold uppercase tracking-widest text-${area.color === "primary" ? "primary" : area.color + "-600"} mb-2`}>{area.area}</p>
                {area.roles.map((r) => (
                  <div key={r} className="flex items-center gap-1.5 py-0.5">
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                    <span className="text-foreground/80">{r}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* 13. Costos */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <DollarSign className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <h3 className="font-bold text-foreground text-sm">13. Costos estimados del sistema</h3>
          </div>
          <div className="space-y-2">
            {[
              {
                phase: "MVP inicial",
                cop: "10.000 – 25.000 millones COP",
                usd: "~2.5M – 6M USD",
                includes: ["Prototipo funcional", "IA básica de clasificación", "Dashboard simple", "Blockchain de registro"],
                color: "emerald",
              },
              {
                phase: "Escala media",
                cop: "50.000 – 120.000 millones COP",
                usd: "~12M – 30M USD",
                includes: ["IA entrenada con datos reales", "Red activa de auditores", "Mapas de datos geográficos"],
                color: "amber",
              },
              {
                phase: "Escala completa nacional",
                cop: "hasta 200.000 millones COP",
                usd: "~50M USD",
                includes: ["Sistema nacional completo", "Blockchain distribuido", "Red masiva de auditores", "Alta disponibilidad 24/7"],
                color: "primary",
              },
            ].map((phase) => (
              <div key={phase.phase} className={`border rounded-xl p-4 space-y-2`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-foreground text-sm">{phase.phase}</p>
                    <p className={`text-[11px] font-mono font-bold text-${phase.color === "primary" ? "primary" : phase.color + "-600"}`}>{phase.cop}</p>
                    <p className="text-[10px] text-muted-foreground">{phase.usd}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {phase.includes.map((f) => (
                    <span key={f} className="text-[10px] bg-muted border rounded-full px-2 py-0.5">{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 14-15. Financiación + Principio */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Globe className="w-4 h-4 text-primary flex-shrink-0" />
            <h3 className="font-bold text-foreground text-sm">14–15. Financiación y principio final</h3>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            {[
              { icon: "🌍", label: "Crowdfunding ciudadano" },
              { icon: "🏛️", label: "Instituciones y fondos" },
              { icon: "💻", label: "Ingresos SaaS" },
            ].map((f) => (
              <div key={f.label} className="border rounded-lg p-3 bg-card">
                <p className="text-xl mb-1">{f.icon}</p>
                <p className="font-medium text-foreground">{f.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-foreground text-background rounded-xl p-5 text-center space-y-2">
            <p className="text-lg font-bold">Principio final</p>
            <p className="text-sm text-background/80 leading-relaxed">
              "La confianza no se asume,<br />
              se construye con evidencia verificable."
            </p>
          </div>
        </section>

      </div>
    ),
  },
];

function ArticleCard({ article, isOpen, onToggle }: { article: Article; isOpen: boolean; onToggle: () => void }) {
  const Icon = article.icon;
  return (
    <div
      className={cn(
        "border rounded-xl overflow-hidden transition-all duration-200 bg-card",
        isOpen ? "shadow-md" : "hover:shadow-sm"
      )}
      data-testid={`article-${article.id}`}
    >
      <button
        className="w-full text-left p-5 flex items-start gap-4 group"
        onClick={onToggle}
      >
        <div className={cn("w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5", article.iconBg)}>
          <Icon className={cn("w-5 h-5", article.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{article.tag}</span>
          </div>
          <h2 className="font-bold text-foreground text-base leading-snug mb-1.5 group-hover:text-primary transition-colors">
            {article.title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{article.summary}</p>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground flex-shrink-0 mt-1.5 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="px-5 pb-6 pt-1 border-t bg-background/50">
          <div className="pt-4">
            {article.content}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Blog() {
  const [openId, setOpenId] = useState<string | null>("problema");

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Hero with video background */}
      <div className="relative rounded-2xl overflow-hidden min-h-[200px] md:min-h-[260px] bg-sidebar">
        {/* Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          poster="/images/hero-blog.png"
        >
          <source src="/videos/blockchain-electoral-network.mp4" type="video/mp4" />
        </video>
        {/* Fallback image */}
        <img
          src="/images/hero-blog.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30 video-fallback"
          style={{ display: "none" }}
        />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar via-sidebar/70 to-primary/20" />
        {/* Colombia flag stripe */}
        <div className="absolute top-0 left-0 right-0 flex h-1">
          <div className="flex-[2] bg-yellow-400" /><div className="flex-1 bg-blue-700" /><div className="flex-1 bg-red-600" />
        </div>

        <div className="relative z-10 p-5 md:p-8 flex flex-col justify-end h-full min-h-[200px] md:min-h-[260px]">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1">
              <div className="w-4 h-2.5 bg-yellow-400 rounded-sm" />
              <div className="w-3 h-2.5 bg-blue-700 rounded-sm" />
              <div className="w-3 h-2.5 bg-red-600 rounded-sm" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/50">República de Colombia</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-1.5">
            Cómo funciona el Sistema
          </h1>
          <p className="text-sm text-sidebar-foreground/70 max-w-sm">
            Documentación técnica y contextual del Sistema de Integridad Electoral — criptografía, IA y código abierto.
          </p>
          <div className="flex items-center gap-3 mt-4 text-xs">
            <span className="flex items-center gap-1.5 text-sidebar-foreground/60 bg-sidebar-accent/50 px-2.5 py-1.5 rounded-full border border-sidebar-border">
              <BookOpen className="w-3 h-3" />
              {articles.length} secciones
            </span>
            <span className="text-sidebar-foreground/60 bg-sidebar-accent/50 px-2.5 py-1.5 rounded-full border border-sidebar-border">~20 min</span>
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-900/30 px-2.5 py-1.5 rounded-full border border-emerald-700/30 font-medium ml-auto">
              <CheckCircle2 className="w-3 h-3" />
              Código abierto
            </span>
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="space-y-3">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            isOpen={openId === article.id}
            onToggle={() => toggle(article.id)}
          />
        ))}
      </div>

      {/* Footer note */}
      <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground mb-1">Nota sobre limitaciones</p>
        <p className="leading-relaxed">
          Este sistema es una herramienta de <strong className="text-foreground">apoyo a la auditoría electoral</strong>, no un sistema de votación electrónica. No reemplaza los procedimientos oficiales de la Registraduría Nacional del Estado Civil ni tiene carácter vinculante. Su propósito es incrementar la transparencia y facilitar el trabajo de observadores electorales independientes.
        </p>
      </div>
    </div>
  );
}
