// Puente entre la web y la app nativa (Capacitor). En el navegador todo funciona sin estos plugins:
// los avisos se sustituyen por "Añadir al calendario" y los archivos se descargan.
//
// Dentro de la app, Capacitor necesita su runtime de JavaScript (@capacitor/core) para hablar con los plugins.
// Se genera al compilar la app (scripts/android.mjs y scripts/ios.mjs → public/vendor/capacitor-core.js)
// y solo se carga dentro de la app: en la web no existe ni hace falta.
const enApp = !!(window.androidBridge || window.webkit?.messageHandlers?.bridge || window.Capacitor?.isNativePlatform?.());
if (enApp && !window.Capacitor?.registerPlugin) {
  try { await import('./vendor/capacitor-core.js'); } catch (e) { console.warn('No se pudo cargar Capacitor', e); }
}
export const esNativa = enApp || !!window.Capacitor?.isNativePlatform?.();
const plugins = new Map();
export function plugin(nombre) {
  if (!esNativa) return null;
  if (!plugins.has(nombre)) {
    const cap = window.Capacitor;
    plugins.set(nombre, cap?.Plugins?.[nombre] || cap?.registerPlugin?.(nombre) || null);
  }
  return plugins.get(nombre);
}

// ---------- Avisos (notificaciones locales, sin servidor) ----------
export async function permisoAvisos(pedir = false) {
  const LN = plugin('LocalNotifications');
  if (!LN) return 'no-disponible';
  try {
    let { display } = await LN.checkPermissions();
    if (display !== 'granted' && pedir) ({ display } = await LN.requestPermissions());
    return display; // 'granted' | 'denied' | 'prompt'
  } catch { return 'no-disponible'; }
}

// lista: [{ id: número entero, titulo, texto, fecha: Date }]. Sustituye todos los avisos pendientes de la app.
export async function programarAvisos(lista) {
  const LN = plugin('LocalNotifications');
  if (!LN) return false;
  try {
    const pend = await LN.getPending();
    if (pend.notifications?.length) await LN.cancel({ notifications: pend.notifications.map((n) => ({ id: n.id })) });
    const ahora = Date.now();
    const futuros = lista.filter((a) => a.fecha.getTime() > ahora + 60_000).slice(0, 60); // Android limita los pendientes
    if (!futuros.length) return true;
    await LN.schedule({
      notifications: futuros.map((a) => ({
        id: a.id, title: a.titulo, body: a.texto,
        schedule: { at: a.fecha, allowWhileIdle: true },
        smallIcon: 'ic_stat_aviso',
      })),
    });
    return true;
  } catch (e) { console.warn('Avisos', e); return false; }
}

// Aviso que se repite cada día a la misma hora (por ejemplo, el juego diario).
export async function avisoDiario({ id, titulo, texto, hora = 9, minuto = 0, activar = true }) {
  const LN = plugin('LocalNotifications');
  if (!LN) return false;
  try {
    await LN.cancel({ notifications: [{ id }] });
    if (!activar) return true;
    await LN.schedule({ notifications: [{ id, title: titulo, body: texto, schedule: { on: { hour: hora, minute: minuto }, allowWhileIdle: true }, smallIcon: 'ic_stat_aviso' }] });
    return true;
  } catch (e) { console.warn('Aviso diario', e); return false; }
}

// ---------- Archivos ----------
// Guarda o comparte un archivo de texto (o base64). En la app abre el menú "Compartir" de Android.
export async function compartirArchivo({ nombre, contenido, tipo = 'text/plain', titulo = nombre }) {
  const FS = plugin('Filesystem');
  const SH = plugin('Share');
  if (FS && SH) {
    const { uri } = await FS.writeFile({ path: nombre, data: contenido, directory: 'CACHE', encoding: 'utf8' });
    await SH.share({ title: titulo, files: [uri] });
    return;
  }
  const blob = new Blob([contenido], { type: tipo });
  const archivo = new File([blob], nombre, { type: tipo });
  if (navigator.canShare?.({ files: [archivo] }) && matchMedia('(pointer: coarse)').matches) {
    try { await navigator.share({ files: [archivo], title: titulo }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: nombre });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// Comparte un texto (por ejemplo, el resultado del juego). Devuelve 'compartido' | 'copiado' | 'cancelado'.
export async function compartirTexto(texto, titulo = '') {
  const SH = plugin('Share');
  try {
    if (SH) { await SH.share({ title: titulo, text: texto }); return 'compartido'; }
    if (navigator.share && matchMedia('(pointer: coarse)').matches) { await navigator.share({ title: titulo, text: texto }); return 'compartido'; }
  } catch (e) { if (e?.name === 'AbortError' || /cancel/i.test(String(e?.message))) return 'cancelado'; }
  try { await navigator.clipboard.writeText(texto); return 'copiado'; } catch { return 'cancelado'; }
}

// Botón «Atrás» de Android: la app decide qué cerrar (un diálogo, volver a la pestaña principal…).
// Si el manejador devuelve false, se sale de la app como haría cualquier app nativa.
export function alPulsarAtras(manejador) {
  const App = plugin('App');
  if (!App) return;
  App.addListener('backButton', () => { if (!manejador()) App.exitApp(); });
}

// Cierra el diálogo abierto (si hay alguno). Devuelve true si ha cerrado algo.
export function cerrarDialogoAbierto() {
  const abiertos = [...document.querySelectorAll('dialog[open]')];
  if (!abiertos.length) return false;
  abiertos.at(-1).close('cancelar');
  return true;
}

export function abrirFuera(url) {
  if (esNativa) { location.href = url; return; } // Capacitor abre los enlaces externos en el navegador del móvil
  window.open(url, '_blank', 'noopener');
}

// Registra el service worker solo en la web (en la app nativa los archivos ya van dentro).
export function registrarSW() {
  if (!esNativa && 'serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}
