import {
  INTENTOS, PROVINCIAS, COMUNIDADES, buscar, evaluar, numeroDelDia, codigoDelDia, pistas, textoCompartir,
  actualizarEstadisticas, direccion,
} from './juego.js';
import { esNativa, avisoDiario, permisoAvisos, compartirTexto, abrirFuera, registrarSW, alPulsarAtras, cerrarDialogoAbierto } from './native.js';

const URL_JUEGO = 'https://danieltolosalopez-ops.github.io/PuebloDelDia/';
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const leer = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const escribir = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin espacio */ } };
const p2 = (n) => String(n).padStart(2, '0');
const hoyLocal = () => { const a = new Date(); return `${a.getFullYear()}-${p2(a.getMonth() + 1)}-${p2(a.getDate())}`; };

const estado = { municipios: [], porCodigo: new Map(), objetivo: null, silueta: null, numero: 0, partida: null, sugerencias: [], elegida: -1 };

function toast(t) {
  const el = $('#toast'); el.textContent = t; el.classList.add('ver');
  clearTimeout(toast.h); toast.h = setTimeout(() => el.classList.remove('ver'), 2600);
}
const nombreCorto = (m) => m[1].includes('/') ? m[1] : m[1].replace(/^(.*), (El|La|Los|Las|L'|O|A|Os|As|Es|Sa|Ses|Els|Les)$/i, (_, a, b) => `${b}${b.endsWith("'") ? '' : ' '}${a}`);
// En HTML, con permiso para pasar de línea tras la «/» de los nombres dobles (si no, se parten a mitad de palabra).
const nombreHTML = (m) => esc(nombreCorto(m)).replace(/\//g, '/<wbr>');

// ================= Carga =================
async function cargar() {
  try {
    const [mun, part] = await Promise.all([
      fetch('datos/municipios.json').then((r) => { if (!r.ok) throw new Error('sin datos'); return r.json(); }),
      fetch('datos/partidas.json').then((r) => r.json()),
    ]);
    estado.municipios = mun.m;
    for (const m of mun.m) estado.porCodigo.set(m[0], m);
    estado.numero = numeroDelDia(hoyLocal());
    const codigo = codigoDelDia(estado.numero, part.orden);
    estado.objetivo = estado.porCodigo.get(codigo);
    estado.silueta = await fetch(`datos/s/${codigo}.json`).then((r) => r.json());
  } catch {
    $('#cargando').textContent = 'Estamos preparando los pueblos. Vuelve a abrir el juego en unos minutos.';
    $('#form-adivinar').hidden = true;
    return;
  }
  $('#numero').textContent = `#${estado.numero}`;
  $('#cargando').hidden = true;
  pintarSilueta();
  const guardada = leer('pd.partida', null);
  estado.partida = guardada?.numero === estado.numero ? guardada : { numero: estado.numero, intentos: [], terminada: false };
  pintarIntentos();
  if (estado.partida.terminada) terminar(false);
  if (!leer('pd.visto', false)) { $('#dlg-ayuda').showModal(); escribir('pd.visto', true); }
}

function pintarSilueta() {
  const s = estado.silueta;
  const dx = (100 - s.w) / 2, dy = (100 - s.h) / 2;
  $('#silueta').innerHTML = `<path d="${s.d}" transform="translate(${dx} ${dy})" fill-rule="evenodd"/>`;
}

// ================= Buscador =================
const entrada = $('#entrada'), lista = $('#sugerencias');
function pintarSugerencias() {
  estado.sugerencias = buscar(entrada.value, estado.municipios, 7);
  estado.elegida = estado.sugerencias.length ? 0 : -1;
  lista.hidden = !estado.sugerencias.length;
  entrada.setAttribute('aria-expanded', String(!lista.hidden));
  lista.innerHTML = estado.sugerencias.map((m, i) => `<li role="option" id="op-${i}" aria-selected="${i === estado.elegida}" data-i="${i}">
    <span>${esc(nombreCorto(m))}</span><small>${esc(PROVINCIAS[m[2]])}</small></li>`).join('');
  entrada.setAttribute('aria-activedescendant', estado.elegida >= 0 ? `op-${estado.elegida}` : '');
}
entrada.addEventListener('input', pintarSugerencias);
entrada.addEventListener('keydown', (e) => {
  if (lista.hidden) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const n = estado.sugerencias.length;
    estado.elegida = (estado.elegida + (e.key === 'ArrowDown' ? 1 : -1) + n) % n;
    lista.querySelectorAll('li').forEach((li, i) => li.setAttribute('aria-selected', String(i === estado.elegida)));
    entrada.setAttribute('aria-activedescendant', `op-${estado.elegida}`);
  } else if (e.key === 'Escape') { lista.hidden = true; }
});
lista.addEventListener('pointerdown', (e) => {
  const li = e.target.closest('li[data-i]');
  if (!li) return;
  e.preventDefault();
  probar(estado.sugerencias[Number(li.dataset.i)]);
});
$('#form-adivinar').addEventListener('submit', (e) => {
  e.preventDefault();
  const m = estado.sugerencias[estado.elegida] || buscar(entrada.value, estado.municipios, 1)[0];
  if (!m) { toast('No encuentro ese municipio'); return; }
  probar(m);
});

// ================= Jugar =================
function probar(m) {
  const p = estado.partida;
  if (p.terminada) return;
  if (p.intentos.some((x) => x.codigo === m[0])) { toast('Ese ya lo has probado'); return; }
  const r = evaluar(m, estado.objetivo);
  p.intentos.push(r);
  entrada.value = ''; lista.hidden = true; entrada.setAttribute('aria-expanded', 'false');
  if (r.acierto || p.intentos.length >= INTENTOS) p.terminada = true;
  escribir('pd.partida', p);
  pintarIntentos(true);
  if (p.terminada) {
    escribir('pd.est', actualizarEstadisticas(leer('pd.est', {}), estado.numero, r.acierto, p.intentos.length));
    terminar(true);
  } else entrada.focus();
}

function pintarIntentos(nuevo = false) {
  const p = estado.partida;
  const filas = [];
  for (let i = 0; i < INTENTOS; i++) {
    const r = p.intentos[i];
    if (!r) { filas.push('<li class="vacia" aria-hidden="true"></li>'); continue; }
    const m = estado.porCodigo.get(r.codigo);
    const nivel = r.acierto ? 'acierto' : r.cercania >= 80 ? 'caliente' : r.cercania >= 55 ? 'templado' : 'frio';
    filas.push(`<li class="${nivel}${nuevo && i === p.intentos.length - 1 ? ' recien' : ''}">
      <span class="i-nombre">${nombreHTML(m)}<small>${esc(PROVINCIAS[m[2]])}</small></span>
      <span class="i-km">${r.acierto ? '¡Es este!' : `${r.km.toLocaleString('es-ES')} km`}</span>
      <span class="i-dir" aria-label="${r.acierto ? 'acierto' : `hacia el ${direccion(r.grados)}`}">${r.acierto ? '<svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg>'
        : `<svg viewBox="0 0 24 24" style="transform:rotate(${Math.round(r.grados)}deg)"><path d="M12 3v18M12 3l-6 6M12 3l6 6"/></svg>`}</span>
      <span class="i-cerca">${r.cercania}%</span>
      <i class="i-barra" style="width:${r.cercania}%"></i>
    </li>`);
  }
  $('#intentos').innerHTML = filas.join('');
  const fallos = p.intentos.filter((x) => !x.acierto).length;
  $('#pistas').innerHTML = (p.terminada ? [] : pistas(fallos, estado.objetivo, estado.silueta)).map((t) => `<li>${esc(t)}</li>`).join('');
  $('#form-adivinar').hidden = p.terminada;
  const quedan = INTENTOS - p.intentos.length;
  entrada.placeholder = quedan === INTENTOS ? 'Escribe un municipio' : `Te ${quedan === 1 ? 'queda 1 intento' : `quedan ${quedan} intentos`}`;
}

// ================= Final =================
async function terminar(animar) {
  const p = estado.partida, o = estado.objetivo;
  const acertado = p.intentos.some((x) => x.acierto);
  const fin = $('#final');
  fin.hidden = false;
  $('#silueta').classList.add('resuelta');
  fin.innerHTML = `
    <p class="resultado-titulo">${acertado ? `¡Acertaste en ${p.intentos.length} ${p.intentos.length === 1 ? 'intento' : 'intentos'}!` : 'Esta vez no ha podido ser.'}</p>
    <h2 class="nombre-pueblo">${nombreHTML(o)}</h2>
    <p class="donde">${esc(PROVINCIAS[o[2]])}, ${esc(COMUNIDADES[o[2]])}. Unos ${estado.silueta.km2.toLocaleString('es-ES')} km² de término municipal.</p>
    <div class="mapa-final" id="mapa-final"></div>
    <div class="acciones">
      <button class="boton" type="button" id="btn-compartir">Compartir resultado</button>
      <button class="boton boton-claro" type="button" id="btn-mapa">Ver en el mapa</button>
    </div>
    <p class="siguiente">Siguiente pueblo en <b id="cuenta"></b></p>`;
  $('#btn-compartir').onclick = async () => {
    const r = await compartirTexto(textoCompartir(estado.numero, p.intentos, acertado, URL_JUEGO), 'Pueblo del Día');
    if (r === 'copiado') toast('Resultado copiado: pégalo en WhatsApp');
  };
  $('#btn-mapa').onclick = () => abrirFuera(`https://www.openstreetmap.org/?mlat=${o[3]}&mlon=${o[4]}#map=12/${o[3]}/${o[4]}`);
  cuentaAtras();
  pintarMapaFinal(animar);
  if (animar) setTimeout(() => fin.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }), 350);
}

function cuentaAtras() {
  const el = $('#cuenta');
  if (!el) return;
  const a = new Date(), m = new Date(a); m.setHours(24, 0, 0, 0);
  const s = Math.max(0, Math.floor((m - a) / 1000));
  el.textContent = `${p2(Math.floor(s / 3600))}:${p2(Math.floor((s % 3600) / 60))}:${p2(s % 60)}`;
  if (s === 0 || otroDia()) { location.reload(); return; }
  clearTimeout(cuentaAtras.h); cuentaAtras.h = setTimeout(cuentaAtras, 1000);
}

// Si la app o la pestaña se quedan abiertas en segundo plano y cambia el día (por ejemplo, al volver a la app
// desde el aviso de las 9:00), se carga el pueblo nuevo en vez de seguir enseñando el de ayer.
const otroDia = () => !!estado.partida && numeroDelDia(hoyLocal()) !== estado.numero;
document.addEventListener('visibilitychange', () => { if (!document.hidden && otroDia()) location.reload(); });

async function pintarMapaFinal(animar) {
  let mapa;
  try { mapa = await fetch('datos/espana.json').then((r) => r.json()); } catch { return; }
  const P = (lat, lon) => {
    if (lat < 30 && lon < -12) { lon += mapa.CANARIAS.dx; lat += mapa.CANARIAS.dy; }
    return [((lon + 9.6) * mapa.COS * mapa.K).toFixed(1), ((44 - lat) * mapa.K).toFixed(1)];
  };
  const o = estado.objetivo;
  const [ox, oy] = P(o[3], o[4]);
  const puntos = estado.partida.intentos.filter((r) => !r.acierto).map((r, i) => {
    const m = estado.porCodigo.get(r.codigo); const [x, y] = P(m[3], m[4]);
    return `<line x1="${x}" y1="${y}" x2="${ox}" y2="${oy}" class="linea"/><circle cx="${x}" cy="${y}" r="3.2" class="intento"/><text x="${x}" y="${Number(y) - 6}" class="num">${i + 1}</text>`;
  }).join('');
  const [mx1, my1, mx2, my2] = mapa.marco;
  $('#mapa-final').innerHTML = `<svg viewBox="0 0 ${mapa.w} ${mapa.h}" role="img" aria-label="Mapa de España con la situación de ${esc(o[1])}">
    <path d="${mapa.d}" class="provincias"/>
    <rect x="${mx1}" y="${my1}" width="${mx2 - mx1}" height="${my2 - my1}" class="marco-canarias"/>
    ${puntos}
    <circle cx="${ox}" cy="${oy}" r="6" class="objetivo${animar ? ' aparece' : ''}"/>
  </svg>`;
}

// ================= Estadísticas y ayuda =================
$('#btn-ayuda').onclick = () => $('#dlg-ayuda').showModal();
$('#btn-estadisticas').onclick = async () => {
  const e = { jugadas: 0, ganadas: 0, racha: 0, mejor: 0, reparto: [0, 0, 0, 0, 0, 0], ...leer('pd.est', {}) };
  const max = Math.max(1, ...e.reparto);
  $('#estadisticas').innerHTML = `
    <dl class="cifras">
      <div><dt>Jugadas</dt><dd>${e.jugadas}</dd></div>
      <div><dt>Aciertos</dt><dd>${e.jugadas ? Math.round(100 * e.ganadas / e.jugadas) : 0}%</dd></div>
      <div><dt>Racha</dt><dd>${e.racha}</dd></div>
      <div><dt>Mejor racha</dt><dd>${e.mejor}</dd></div>
    </dl>
    <h3>Intentos que necesitas</h3>
    <ol class="reparto">${e.reparto.map((n, i) => `<li><span>${i + 1}</span><i style="width:${Math.max(6, 100 * n / max)}%">${n}</i></li>`).join('')}</ol>`;
  if (esNativa) {
    $('#fila-aviso').hidden = false;
    $('#aviso-diario').checked = leer('pd.aviso', false);
  }
  $('#dlg-estadisticas').showModal();
};
$('#aviso-diario').addEventListener('change', async (e) => {
  const activar = e.target.checked;
  if (activar && (await permisoAvisos(true)) !== 'granted') { e.target.checked = false; toast('Activa las notificaciones en los ajustes del móvil'); return; }
  await avisoDiario({ id: 1, titulo: 'Ya está el pueblo de hoy', texto: '¿Lo sacas en menos de 3 intentos?', hora: 9, activar });
  escribir('pd.aviso', activar);
  toast(activar ? 'Te avisaremos cada día a las 9:00' : 'Aviso diario desactivado');
});

alPulsarAtras(() => {
  if (!lista.hidden) { lista.hidden = true; return true; }
  return cerrarDialogoAbierto();
});
cargar();
registrarSW();
