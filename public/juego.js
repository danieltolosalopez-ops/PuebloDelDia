// Reglas del juego, sin dependencias del navegador (se usan también al generar los datos y en las pruebas).

export const INICIO = '2026-11-26';
export const INTENTOS = 6;
export const MAX_KM = 1100; // a partir de aquí la cercanía es 0 %

export const PROVINCIAS = {
  '01': 'Álava', '02': 'Albacete', '03': 'Alicante', '04': 'Almería', '05': 'Ávila', '06': 'Badajoz', '07': 'Illes Balears',
  '08': 'Barcelona', '09': 'Burgos', 10: 'Cáceres', 11: 'Cádiz', 12: 'Castellón', 13: 'Ciudad Real', 14: 'Córdoba', 15: 'A Coruña',
  16: 'Cuenca', 17: 'Girona', 18: 'Granada', 19: 'Guadalajara', 20: 'Gipuzkoa', 21: 'Huelva', 22: 'Huesca', 23: 'Jaén', 24: 'León',
  25: 'Lleida', 26: 'La Rioja', 27: 'Lugo', 28: 'Madrid', 29: 'Málaga', 30: 'Murcia', 31: 'Navarra', 32: 'Ourense', 33: 'Asturias',
  34: 'Palencia', 35: 'Las Palmas', 36: 'Pontevedra', 37: 'Salamanca', 38: 'Santa Cruz de Tenerife', 39: 'Cantabria', 40: 'Segovia',
  41: 'Sevilla', 42: 'Soria', 43: 'Tarragona', 44: 'Teruel', 45: 'Toledo', 46: 'Valencia', 47: 'Valladolid', 48: 'Bizkaia',
  49: 'Zamora', 50: 'Zaragoza', 51: 'Ceuta', 52: 'Melilla',
};
const CCAA = {
  Andalucía: ['04', '11', '14', '18', '21', '23', '29', '41'], Aragón: ['22', '44', '50'], Asturias: ['33'], 'Illes Balears': ['07'],
  Canarias: ['35', '38'], Cantabria: ['39'], 'Castilla y León': ['05', '09', '24', '34', '37', '40', '42', '47', '49'],
  'Castilla-La Mancha': ['02', '13', '16', '19', '45'], Cataluña: ['08', '17', '25', '43'], 'Comunitat Valenciana': ['03', '12', '46'],
  Extremadura: ['06', '10'], Galicia: ['15', '27', '32', '36'], 'Comunidad de Madrid': ['28'], 'Región de Murcia': ['30'],
  Navarra: ['31'], 'País Vasco': ['01', '20', '48'], 'La Rioja': ['26'], Ceuta: ['51'], Melilla: ['52'],
};
export const COMUNIDADES = Object.fromEntries(Object.entries(CCAA).flatMap(([n, ps]) => ps.map((p) => [p, n])));

// ---------- Nombres ----------
export function normalizar(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[’`´]/g, "'").replace(/[^a-z0-9ñç' ]+/g, ' ').replace(/\s+/g, ' ').trim();
}
// "Coruña, A" → "a coruña"; "Donostia/San Sebastián" → ["donostia/san sebastián", "donostia", "san sebastián"]
export function variantes(nombre) {
  const out = new Set();
  const añadir = (n) => {
    const t = n.trim();
    if (!t) return;
    out.add(normalizar(t));
    const m = t.match(/^(.*),\s*(el|la|los|las|l'|o|a|os|as|es|sa|ses|els|les|lo)$/i);
    if (m) out.add(normalizar(`${m[2]}${m[2].endsWith("'") ? '' : ' '}${m[1]}`));
  };
  añadir(nombre);
  for (const parte of nombre.split('/')) añadir(parte);
  return [...out];
}

// Busca municipios por lo que se ha escrito: primero los que empiezan así, luego los que lo contienen.
export function buscar(texto, municipios, limite = 8) {
  const q = normalizar(texto);
  if (q.length < 2) return [];
  const empieza = [], contiene = [];
  for (const m of municipios) {
    const vs = m._v || (m._v = variantes(m[1]));
    if (vs.some((v) => v.startsWith(q))) empieza.push(m);
    else if (vs.some((v) => v.includes(q))) contiene.push(m);
    if (empieza.length >= limite) break;
  }
  return [...empieza, ...contiene].slice(0, limite);
}

// ---------- Distancias ----------
const RAD = Math.PI / 180;
export function distanciaKm(a, b) {
  const [la1, lo1] = a, [la2, lo2] = b;
  const h = Math.sin((la2 - la1) * RAD / 2) ** 2 + Math.cos(la1 * RAD) * Math.cos(la2 * RAD) * Math.sin((lo2 - lo1) * RAD / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
export function rumbo(a, b) { // grados desde el norte, de a hacia b
  const [la1, lo1] = a.map((x) => x * RAD), [la2, lo2] = b.map((x) => x * RAD);
  const y = Math.sin(lo2 - lo1) * Math.cos(la2);
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(lo2 - lo1);
  return (Math.atan2(y, x) / RAD + 360) % 360;
}
const FLECHAS = ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️'];
const PUNTOS = ['norte', 'noreste', 'este', 'sureste', 'sur', 'suroeste', 'oeste', 'noroeste'];
export const flecha = (grados) => FLECHAS[Math.round(grados / 45) % 8];
export const direccion = (grados) => PUNTOS[Math.round(grados / 45) % 8];
export const cercania = (km) => Math.max(0, Math.round(100 * (1 - km / MAX_KM)));

// Evalúa un intento: m y objetivo son [código, nombre, prov, lat, lon]
export function evaluar(m, objetivo) {
  if (m[0] === objetivo[0]) return { codigo: m[0], km: 0, acierto: true, cercania: 100, grados: 0 };
  const a = [m[3], m[4]], b = [objetivo[3], objetivo[4]];
  const km = distanciaKm(a, b);
  return { codigo: m[0], km: Math.round(km), acierto: false, cercania: cercania(km), grados: rumbo(a, b) };
}

// ---------- Día y partida ----------
export function numeroDelDia(hoyISO) {
  return Math.floor((Date.parse(`${hoyISO}T00:00:00Z`) - Date.parse(`${INICIO}T00:00:00Z`)) / 864e5) + 1;
}
export function codigoDelDia(numero, orden) {
  return orden[((numero - 1) % orden.length + orden.length) % orden.length];
}

// Pistas que se van desbloqueando con los fallos.
export function pistas(fallos, objetivo, silueta) {
  const out = [];
  if (fallos >= 2 && silueta?.km2) out.push(`Mide unos ${silueta.km2.toLocaleString('es-ES')} km².`);
  if (fallos >= 3) out.push(`Está en ${COMUNIDADES[objetivo[2]]}.`);
  if (fallos >= 5) out.push(`Provincia: ${PROVINCIAS[objetivo[2]]}.`);
  return out;
}

// ---------- Compartir ----------
export function cuadros(cerc) {
  const llenos = Math.floor(cerc / 20);
  const medio = cerc % 20 >= 10 && llenos < 5 ? 1 : 0;
  return '🟩'.repeat(llenos) + '🟨'.repeat(medio) + '⬜'.repeat(5 - llenos - medio);
}
export function textoCompartir(numero, intentos, acertado, url) {
  const filas = intentos.map((r) => `${cuadros(r.cercania)}${r.acierto ? '🎉' : flecha(r.grados)}`);
  return `Pueblo del Día #${numero} ${acertado ? intentos.length : 'X'}/${INTENTOS}\n${filas.join('\n')}\n${url}`;
}

// ---------- Estadísticas ----------
export function actualizarEstadisticas(est, numero, acertado, intentos) {
  const e = { jugadas: 0, ganadas: 0, racha: 0, mejor: 0, ultima: null, reparto: [0, 0, 0, 0, 0, 0], ...est };
  if (e.ultima === numero) return e;
  e.jugadas++;
  if (acertado) {
    e.ganadas++; e.reparto[intentos - 1]++;
    e.racha = e.ultima === numero - 1 ? e.racha + 1 : 1;
    e.mejor = Math.max(e.mejor, e.racha);
  } else e.racha = 0;
  e.ultima = numero;
  return e;
}
