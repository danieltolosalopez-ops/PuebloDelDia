# Pueblo del Día · Adivina el pueblo por su silueta

Cada día, la silueta de un pueblo o ciudad de España. Tienes **6 intentos**: cada fallo te dice **a cuántos kilómetros** está, **hacia dónde** y **lo cerca** que te has quedado. Al terminar, el pueblo aparece en el mapa y puedes **compartir el resultado** por WhatsApp sin desvelar la respuesta.

- **Web (y app instalable desde el navegador):** https://danieltolosalopez-ops.github.io/PuebloDelDia/
- **App de Android:** pestaña *Releases* de este repositorio.
- Sin registro, sin servidor y sin anuncios. Coste de funcionamiento: 0 €.

## Cómo funciona

- Se puede escribir **cualquiera de los 8.000 municipios** de España (con o sin tildes, en castellano o en la otra lengua oficial).
- Pueden salir **más de 500 pueblos**: capitales, ciudades y pueblos conocidos (`scripts/pueblos.mjs`), uno distinto cada día durante más de un año y sin repetir provincia dos días seguidos.
- Pistas tras los fallos: tamaño del término municipal, comunidad y provincia.
- Estadísticas, rachas y, en la app de Android, aviso diario opcional a las 9:00.

## De dónde salen los datos

El workflow **Generar los pueblos** (`.github/workflows/datos.yml`) descarga los límites municipales oficiales del **Instituto Geográfico Nacional** (CNIG, licencia CC BY 4.0) con la herramienta pública [es-atlas](https://github.com/martgnz/es-atlas), genera las siluetas y el orden de las partidas en `public/datos/`, los guarda en el repositorio y vuelve a publicar la web y la app. Se lanza solo cuando cambia la lista de pueblos y se puede lanzar a mano desde *Actions*. Al regenerar, **los días ya jugados y las dos semanas siguientes no cambian**.

Para añadir o quitar pueblos: edita `scripts/pueblos.mjs` (nombre y código de provincia). El workflow avisa de los nombres que no encuentra en los datos oficiales.

## Estructura

```
public/            el juego (HTML, CSS y JavaScript sin librerías)
  juego.js         reglas: distancias, direcciones, búsqueda, pistas, compartir, estadísticas
  app.js           interfaz
  datos/           generado por GitHub (no editar a mano)
scripts/           pueblos.mjs (lista), datos.mjs (generador), android.mjs, ios.mjs, iconos.py
test/              pruebas (node --test test/*.test.mjs) con un mapa de prueba (fixture.mjs) y recorrido visual
android-res/       iconos y pantalla de inicio de Android
ios-res/           pantalla de inicio de iPhone
store/             FICHA.md (textos de las tiendas), iconos, imagen destacada y capturas
```

## Puesta en marcha (una sola vez)

1. *Settings → Pages → Build and deployment → Source:* **GitHub Actions**.
2. La primera vez, espera a que termine **Generar los pueblos** (unos 10 minutos): después se publican la web y la app con los datos.

## App de Android (sin Android Studio)

Cada vez que se sube un cambio a `main`, GitHub compila la app solo (workflow **App Android**, pestaña *Actions*). Cuando termina (unos 8-10 minutos), en la pestaña **Releases** del repositorio aparece **«App Android (última versión)»** con:

- `PuebloDelDia-prueba.apk` (o `PuebloDelDia.apk` si hay firma): ábrelo desde el móvil para instalar la app y probarla. Android te pedirá permitir «instalar apps de origen desconocido» solo esa vez.
- `PuebloDelDia-google-play.aab`: el archivo que se sube a Google Play (solo aparece cuando la firma está configurada).

La app usa **Capacitor 8**, que apunta a **Android 16 (API 36)**: lo que Google Play exige desde el 31 de agosto de 2026 para apps nuevas.

### Firma (necesaria para Google Play)

La firma está guardada en los *secrets* del repositorio (*Settings → Secrets and variables → Actions*):

| Secret | Qué es |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | el archivo de firma (`.jks`) en base64 |
| `ANDROID_KEYSTORE_PASSWORD` | contraseña del archivo |
| `ANDROID_KEY_ALIAS` | nombre de la clave |
| `ANDROID_KEY_PASSWORD` | contraseña de la clave |

**Guarda una copia del archivo `.jks` y de sus contraseñas fuera de GitHub** (por ejemplo, en tu gestor de contraseñas). Es tu «clave de subida» a Google Play: si la pierdes, hay que pedir a Google que la cambie.

Para crear una firma nueva: `keytool -genkeypair -v -keystore firma.jks -alias subida -keyalg RSA -keysize 2048 -validity 10000` y `base64 -w0 firma.jks` para el primer secret.

### Publicar en Google Play

1. Cuenta de desarrollador de Google Play (25 $, una sola vez; sirve para todas tus apps).
2. *Crear aplicación* → nombre, idioma español, gratuita.
3. **Prueba cerrada** con al menos **12 testers durante 14 días seguidos** (obligatorio en cuentas personales nuevas). Puedes usar el mismo grupo de testers para todas tus apps.
4. Sube el `.aab` de *Releases*. Activa *Firma de apps de Google Play* (Google guarda la clave final; la tuya es solo la de subida).
5. Ficha de la tienda: icono `store/play-icon-512.png`, imagen destacada `store/play-destacada-1024x500.png`, 2-8 capturas hechas con el móvil, y la política de privacidad: `https://danieltolosalopez-ops.github.io/PuebloDelDia/privacy.html`.
6. Formularios: *Seguridad de los datos* → «No se recoge ni se comparte ningún dato»; *Anuncios* → no; *Clasificación de contenido* → cuestionario (juego de preguntas, apto para todos). Categoría: Juegos → Preguntas y respuestas.


## App de iPhone (App Store) sin Mac

El workflow **App iPhone** compila la app en un Mac de GitHub (macOS 26 con Xcode 26, lo que exige App Store desde abril de 2026):

- **Sin configurar nada:** en cada cambio comprueba que la app de iPhone compila.
- **Con tu cuenta de Apple configurada:** la firma y la sube a App Store Connect. Aparece en **TestFlight** y desde ahí la envías a revisión.

La app es solo para iPhone y en vertical, así que App Store no pide capturas de iPad.

### Lo que hay que hacer una vez (vale para todas tus apps)

1. Darte de alta en el **Apple Developer Program** (99 $/año) en developer.apple.com.
2. **App Store Connect → Usuarios y acceso → Integraciones → App Store Connect API → Generar clave**, con acceso **Admin** (lo necesita Xcode para crear los certificados él solo). Descarga el archivo `.p8` (solo se puede descargar una vez) y apunta el **Key ID** y el **Issuer ID**.
3. Tu **Team ID**: developer.apple.com → Account → Membership details.
4. En este repositorio, *Settings → Secrets and variables → Actions*:

| Secret | Qué es |
|---|---|
| `APPLE_TEAM_ID` | el Team ID |
| `ASC_KEY_ID` | el Key ID de la clave |
| `ASC_ISSUER_ID` | el Issuer ID |
| `ASC_KEY_P8` | el contenido completo del archivo `.p8` (desde `-----BEGIN PRIVATE KEY-----` hasta el final) |

5. **App Store Connect → Apps → «+» → Nueva app**: iOS, nombre, idioma español, Bundle ID `io.github.danieltolosalopezops.pueblodeldia` y un SKU cualquiera (por ejemplo, `pueblodeldia-ios`). Si el Bundle ID aún no aparece, lanza una vez el workflow *App iPhone*: Xcode lo registra solo.
6. *Actions → App iPhone → Run workflow*. En unos 15-20 minutos la versión aparece en TestFlight. Rellena la ficha con los textos de `store/FICHA.md`, añade las capturas de `store/capturas/iphone-6.9/` y `store/capturas/iphone-6.3/` y envía a revisión.

## Ficha de las tiendas

`store/FICHA.md` tiene todos los textos para Google Play y App Store (nombre, descripciones, palabras clave, categoría, URLs, respuestas de privacidad y notas para la revisión), ya ajustados a los límites de caracteres. Las capturas están en `store/capturas/` a los tamaños que piden las tiendas. Para rehacerlas: `bash test/capturas.sh public test/capturas.pasos.mjs store`. En este juego las capturas necesitan los datos reales de `public/datos`: la revisión automática las genera en cuanto GitHub haya creado los datos.

## Revisión automática

Una tarea programada revisa la app dos veces al día (pruebas, web publicada y compilaciones de Android e iPhone) y corrige los fallos que encuentre. Lo que hace queda anotado en `MANTENIMIENTO.md`.

## Ideas para ganar dinero más adelante

- Un banner discreto (AdMob) en la pantalla final y opción de pago para quitarlo.
- «Archivo»: jugar los días anteriores (pago único).
- Versiones temáticas con el mismo motor: provincias, comarcas, islas, ríos.

Fuentes tipográficas: Anton y Source Sans 3 (licencia SIL Open Font License, en `public/fonts`).
