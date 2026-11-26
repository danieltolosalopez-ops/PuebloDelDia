# Registro de mantenimiento

Revisión automática dos veces al día. Aquí solo se anotan los días en que se corrigió algo o se detectó un problema.

| Fecha | Qué pasó | Qué se hizo |
|---|---|---|
| 26/11/2026 | Publicación inicial | Web, app de Android (Capacitor 8, API 36) e iPhone (Xcode 26) preparadas en GitHub Actions. |
| 26/11/2026 | Primera generación de datos: la descarga detallada del CNIG se cortó (siluetas más simples, de la versión preparada de es-atlas) y 3 pueblos no se encontraron por cómo se escriben oficialmente (Guadalest, San Ildefonso, El Burgo de Osma). | Descarga del CNIG con reintentos y sin marcar error si falla; los nombres de la lista se comparan también con el artículo delante o detrás. |
| 27/11/2026 | Si la app (o la pestaña del navegador) se quedaba abierta en segundo plano, al volver a ella al día siguiente —por ejemplo, desde el aviso de las 9:00— seguía mostrando el pueblo de ayer, con una cuenta atrás de muchas horas. Además, la prueba visual daba por hecho que el pueblo de hoy es siempre el primero de la lista, así que fallaba desde el día 2. | La app comprueba el día al volver a ella y en cada segundo de la cuenta atrás, y carga el pueblo nuevo si ha cambiado. La prueba visual calcula el pueblo de hoy igual que la app y comprueba también el cambio de día. |
| 27/11/2026 | Problema detectado (sin corregir): la descarga detallada del CNIG falla siempre desde GitHub (la conexión se corta), así que todas las siluetas salen de la versión simplificada de es-atlas. 196 de los 560 pueblos tienen menos de 15 puntos y algunos son casi un triángulo; el primero con menos de 8 puntos sale el día 6. | Avisado a Daniel: hace falta decidir otra fuente de límites municipales con más detalle. No se ha tocado nada de los datos. |
