# Manifiesto — Sistema de Integridad Electoral

> *"La confianza no se asume. Se construye con evidencia verificable."*

---

## Por qué existe este sistema

Las democracias modernas descansan sobre un acto de fe colectiva: que los votos contados son los votos emitidos. En Colombia — y en gran parte de Latinoamérica — ese acto de fe descansa sobre papel. Sobre actas físicas. Sobre la buena voluntad de miles de jurados ciudadanos y funcionarios públicos.

Este sistema no nació de la desconfianza hacia las instituciones. Nació de una convicción más profunda: **la transparencia no debería depender de la buena voluntad de nadie**. Debería ser estructural, técnica, auditable por cualquier persona con acceso a internet.

---

## Qué creemos

**Creemos que los datos electorales son del pueblo.**
No de los partidos, no del gobierno, no de los observadores internacionales. Del pueblo. Y lo que le pertenece al pueblo debe poder ser verificado por el pueblo.

**Creemos que la tecnología no reemplaza la democracia.**
Este sistema es una herramienta. No decide quién ganó. No interpreta resultados. No reemplaza la auditoría humana. Hace una sola cosa: garantiza que lo que se registró hoy es exactamente lo mismo que se puede consultar mañana.

**Creemos en el código abierto como principio democrático.**
Un sistema de verificación electoral que no puede ser auditado en su código fuente no puede ser confiable. Por eso este sistema es MIT — cualquier persona, organización o gobierno puede usarlo, inspeccionarlo, modificarlo y redistribuirlo. La transparencia del código es tan importante como la transparencia de los datos.

**Creemos en la colaboración sobre la competencia.**
No somos un producto. Somos un bien público tecnológico. Las mejoras que hacen el sistema más confiable benefician a todos — no solo a quienes las construyeron.

---

## Qué no somos

No somos un partido político. No tenemos afiliación ideológica.
No tomamos posición sobre candidatos, partidos o resultados electorales.
No reemplazamos a la Registraduría Nacional ni a ningún organismo electoral oficial.
No somos la solución única. Somos una capa adicional de verificación.

---

## Principios técnicos

### Inmutabilidad por diseño
Una vez registrado un acta, su hash SHA-256 queda encadenado al ledger. Cualquier modificación posterior es matemáticamente detectable. No existe un botón de "editar". No existe un mecanismo de borrado silencioso.

### Verificabilidad independiente
Cualquier técnico puede descargar el código, conectarlo a la misma base de datos, y recalcular todos los hashes de la cadena. El resultado debe ser idéntico. Si no lo es, algo está mal — y el sistema lo dice.

### Mínimo privilegio
El sistema solo almacena lo necesario: la imagen, su hash, el texto extraído, la ubicación y el bloque. No almacena datos personales de quienes suben las actas. No hay tracking.

### Transparencia sobre perfección
Preferimos documentar las limitaciones del sistema claramente antes que presentarlo como infalible. El OCR no siempre funciona. La detección multi-modelo puede equivocarse. Los humanos que auditan pueden tener sesgos. El sistema reconoce esto y lo comunica.

---

## Arquitectura de confianza

```
Nivel 1 — Criptografía
  SHA-256 del archivo original → imposible de falsificar retroactivamente
  Block hash encadenado → modificar un bloque invalida todos los posteriores

Nivel 2 — IA como asistente
  OCR para extraer texto → detecta actas ilegibles o inconsistentes
  Multi-modelo para scoring → 4 engines votan sobre la integridad del documento
  La IA prioriza revisión, no decide verdad

Nivel 3 — Auditoría humana
  Observadores ciudadanos validan casos marcados por la IA
  El criterio humano tiene la última palabra
  Los resultados de auditoría también quedan registrados en el ledger

Nivel 4 — Código abierto
  Todo el código es público e inspeccionable
  La lógica de encadenamiento puede ser reimplementada por cualquiera
  La confianza en el sistema no requiere confianza en sus creadores
```

---

## Visión a largo plazo

Este MVP es el primer paso. La visión completa incluye:

- **Red distribuida de auditores** ciudadanos entrenados en todo el territorio nacional
- **Mapas de riesgo geográfico** que identifiquen zonas con tasas inusualmente altas de actas sospechosas
- **API pública** para que medios de comunicación, académicos y organizaciones civiles puedan consultar y verificar datos
- **Módulos para otros documentos públicos**: licitaciones, contratos gubernamentales, actas de consejos municipales
- **Extensión a otros países** de Latinoamérica con procesos electorales similares

---

## A los colaboradores

Si estás leyendo esto, probablemente ya crees en lo mismo que nosotros: que la tecnología puede fortalecer la democracia cuando se construye con los principios correctos.

Contribuir a este sistema es contribuir a algo más grande que el código. Es contribuir a la posibilidad de que un ciudadano en un municipio remoto de Colombia pueda verificar, con su propio teléfono, que el acta de su mesa de votación llegó intacta.

Eso vale la pena.

---

## A los escépticos

Tienes razón en ser escéptico. Un sistema de este tipo puede ser capturado políticamente, puede tener fallas técnicas, puede ser usado para fines que no imaginamos. Por eso:

- El código es abierto — puedes auditarlo
- La arquitectura es auditable — puedes verificarla independientemente
- La gobernanza es colectiva — puedes cuestionarla en Discussions
- La licencia es MIT — puedes forkear y construir una alternativa

Preferimos un sistema imperfecto y auditable a uno perfecto y opaco.

---

*Sistema de Integridad Electoral — Colombia*
*Código abierto. MIT License. 2026.*
