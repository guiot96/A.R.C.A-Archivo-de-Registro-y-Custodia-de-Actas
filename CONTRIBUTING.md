# Guía de Contribución

Gracias por tu interés en contribuir al **Sistema de Integridad Electoral**. Este es un proyecto de código abierto orientado a fortalecer la democracia en Colombia y Latinoamérica. Tu contribución importa — sea código, documentación, traducción o feedback.

---

## Código de conducta

Al participar en este proyecto, aceptas mantener un ambiente respetuoso, inclusivo y libre de acoso. No toleramos discriminación de ningún tipo. Trata a cada contribuidor con la misma consideración que merece quien trabaja por el bien común.

---

## Formas de contribuir

### Reportar un bug
1. Verifica primero que el bug no esté ya reportado en [Issues](../../issues)
2. Usa la plantilla de bug report al abrir un nuevo issue
3. Incluye pasos reproducibles, comportamiento esperado vs. real, y capturas si aplica

### Proponer una nueva función
1. Abre un issue usando la plantilla de feature request
2. Describe el problema que resuelve, no solo la solución
3. Espera feedback antes de empezar a implementar algo grande

### Documentación
- Corrige errores ortográficos o de redacción en cualquier `.md`
- Mejora los comentarios en el código
- Traduce documentación al inglés, portugués u otros idiomas
- Estos PRs son bienvenidos directamente sin issue previo

### Código
- Corrige bugs (ideal: adjunta el issue correspondiente)
- Implementa funciones previamente aprobadas en issues
- Mejora performance o accesibilidad
- Escribe o mejora tests

---

## Proceso de Pull Request

### 1. Fork y setup

```bash
# Fork en GitHub, luego:
git clone https://github.com/TU_USUARIO/integridad-electoral.git
cd integridad-electoral

# Instalar dependencias
pnpm install

# Crear rama (siempre desde main actualizado)
git checkout main
git pull origin main
git checkout -b tipo/descripcion-corta
```

### 2. Tipos de rama

Usa prefijos descriptivos:

| Prefijo | Uso |
|---------|-----|
| `feat/` | Nueva función |
| `fix/` | Corrección de bug |
| `docs/` | Solo documentación |
| `refactor/` | Refactorización sin cambio de comportamiento |
| `test/` | Añadir o mejorar tests |
| `chore/` | Mantenimiento, dependencias, tooling |
| `perf/` | Mejora de performance |
| `security/` | Corrección de seguridad |

Ejemplo: `feat/filtro-por-municipio`, `fix/hash-null-crash`

### 3. Commits convencionales

Sigue el estándar [Conventional Commits](https://www.conventionalcommits.org):

```
tipo(scope): descripción en imperativo, minúsculas, sin punto final

[cuerpo opcional — explica el QUÉ y el POR QUÉ, no el CÓMO]

[pie opcional — referencias a issues]
```

**Ejemplos correctos:**
```
feat(upload): agregar soporte para cola de múltiples archivos
fix(blockchain): corregir cálculo de hash cuando prev_hash es null
docs(readme): agregar sección de variables de entorno
refactor(detection): extraer lógica CNN a función separada
```

**Tipos válidos:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `security`

### 4. Antes de abrir el PR

```bash
# Verificar que compila sin errores
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/election-dashboard run typecheck

# Buildear API server
pnpm --filter @workspace/api-server run build

# Levantar y probar manualmente
pnpm --filter @workspace/api-server run dev &
pnpm --filter @workspace/election-dashboard run dev
```

### 5. Abrir el Pull Request

- Usa el título en formato Conventional Commits
- Completa la plantilla de PR
- Enlaza el issue que resuelve: `Closes #123`
- Agrega capturas de pantalla si cambiaste la UI
- Marca como "Draft" si todavía está en progreso

### 6. Revisión

- Al menos **1 aprobación** es requerida para mergear
- Responde a los comentarios con claridad
- Empuja commits de corrección (no hagas force-push a menos que se pida)
- Una vez aprobado, el mantenedor hace el merge usando **Squash and merge**

---

## Estándares de código

### TypeScript
- Usa tipos explícitos — evita `any`
- Prefiere `interface` para objetos, `type` para uniones/intersecciones
- Nombra variables y funciones en **camelCase**, componentes en **PascalCase**
- Exporta todo desde el archivo donde se define — evita barrel files circulares

### React
- Un componente por archivo
- Props tipadas con `type` o `interface`
- Evita efectos innecesarios — prefiere derived state
- No dejes `console.log` en el código producción

### Backend (Express)
- Rutas en archivos separados por dominio
- Siempre maneja errores explícitamente — no silencies excepciones
- Valida inputs con Zod antes de usar datos del request
- Logs con `req.log` (pino-http) — no con `console.log`

### SQL / Drizzle
- Todo schema en `lib/db/src/schema/`
- Migraciones versionadas — nunca modificar una migración existente
- Usar transacciones para operaciones que deben ser atómicas

### CSS / Tailwind
- Mobile-first: las clases base aplican a móvil, `md:` para escritorio
- Usa las variables de color del sistema (`text-foreground`, `bg-card`, etc.)
- Evita valores mágicos — si usas un color personalizado, justifícalo

---

## Tests

Actualmente el proyecto usa tests E2E con Playwright. Si agregás una función:

```bash
# Correr tests existentes
pnpm test

# Los tests verifican flujos completos de usuario
# Agrega casos de prueba si tu función cambia algún flujo
```

---

## Preguntas frecuentes

**¿Necesito saber sobre elecciones colombianas para contribuir?**
No. Puedes contribuir a cualquier aspecto técnico — frontend, backend, docs, CI — sin conocimiento electoral previo.

**¿Puedo contribuir en inglés?**
Sí. El código, comentarios y PRs pueden estar en inglés. La UI del sistema está en español porque está orientada a usuarios colombianos, pero el proceso de desarrollo es bilingüe.

**¿Cuánto tiempo tarda la revisión de un PR?**
Intentamos responder en 72 horas hábiles. PRs de documentación o fixes simples suelen ser más rápidos.

**¿Cómo reporto una vulnerabilidad de seguridad?**
Lee [SECURITY.md](SECURITY.md) — no abras un issue público.

---

## Mantenedores

| Rol | Responsabilidades |
|-----|-------------------|
| Mantenedor principal | Revisión de PRs, releases, roadmap |
| Revisor técnico | Revisión de código backend/frontend |
| Revisor de seguridad | Revisión de cambios con impacto en seguridad |

Para proponer cambios al proyecto mismo (governance, roadmap, estructura), abre una discusión en [Discussions](../../discussions).

---

Gracias por contribuir a la transparencia democrática de Colombia.
