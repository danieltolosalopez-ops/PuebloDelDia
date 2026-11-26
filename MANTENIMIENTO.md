# Registro de mantenimiento

Revisión automática dos veces al día. Aquí solo se anotan los días en que se corrigió algo o se detectó un problema.

| Fecha | Qué pasó | Qué se hizo |
|---|---|---|
| 26/11/2026 | Publicación inicial | Web, app de Android (Capacitor 8, API 36) e iPhone (Xcode 26) preparadas en GitHub Actions. |
| 26/11/2026 | Primera generación de datos: la descarga detallada del CNIG se cortó (siluetas más simples, de la versión preparada de es-atlas) y 3 pueblos no se encontraron por cómo se escriben oficialmente (Guadalest, San Ildefonso, El Burgo de Osma). | Descarga del CNIG con reintentos y sin marcar error si falla; los nombres de la lista se comparan también con el artículo delante o detrás. |
