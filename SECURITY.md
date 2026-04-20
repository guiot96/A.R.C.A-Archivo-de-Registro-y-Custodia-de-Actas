# Política de Seguridad

## Versiones soportadas

| Versión | Soporte de seguridad |
|---------|---------------------|
| `main` (latest) | Sí — parches activos |
| Versiones anteriores | No — actualiza a `main` |

---

## Reportar una vulnerabilidad

**No abras un issue público para reportar vulnerabilidades de seguridad.**

Si descubriste una vulnerabilidad, envía un reporte privado a través de una de estas vías:

1. **GitHub Security Advisories** (preferido): Ve a la pestaña "Security" del repositorio → "Report a vulnerability"
2. **Email**: security@integridad-electoral.co *(reemplaza con el email real del proyecto)*

### Qué incluir en el reporte

- Descripción clara de la vulnerabilidad
- Pasos para reproducirla
- Impacto potencial (qué datos o funciones se ven afectados)
- Versión o commit donde se manifiesta
- Si tienes un proof of concept, inclúyelo (de forma responsable)

---

## Proceso de respuesta

| Plazo | Acción |
|-------|--------|
| 48 h | Confirmación de recibo del reporte |
| 7 días | Evaluación inicial e impacto |
| 30 días | Parche desarrollado y testeado |
| 90 días | Divulgación pública coordinada (CVE si aplica) |

Si el plazo de 30 días no es alcanzable, te lo comunicamos con una actualización.

---

## Alcance

Los siguientes tipos de vulnerabilidades son de alta prioridad para nosotros:

- **Integridad de datos**: cualquier vector que permita modificar actas o hashes sin evidencia
- **Inyección SQL**: acceso o modificación no autorizada a la base de datos
- **Inyección de comandos**: ejecución de código arbitrario en el servidor
- **Exposición de datos sensibles**: imágenes de actas accesibles sin autorización
- **Broken authentication**: bypass de controles de acceso
- **Path traversal**: acceso a archivos fuera del directorio permitido

---

## Fuera de alcance

- Ataques de denegación de servicio (DoS) a instancias de demostración
- Social engineering a mantenedores del proyecto
- Vulnerabilidades en dependencias ya conocidas y sin parche upstream
- Problemas en ramas no mantenidas

---

## Divulgación responsable

Seguimos el principio de **divulgación coordinada**: trabajamos contigo para corregir la vulnerabilidad antes de cualquier divulgación pública. Reconocemos públicamente a los investigadores de seguridad que reporten de forma responsable (si lo desean).

---

## Agradecimientos

Agradecemos a todos los investigadores de seguridad que contribuyen a hacer este sistema más robusto. La integridad de este sistema es la integridad de los datos electorales colombianos.
