// Genera los datos del juego a partir de los límites municipales oficiales (IGN, en TopoJSON de es-atlas).
// Uso: node scripts/datos.mjs <municipalities.json> <carpeta-salida>
// Salida:
//   municipios.json  todos los municipios (código INE, nombre, provincia, centro) para buscar y medir distancias
//   partidas.json    orden de los pueblos del día (se conserva lo ya jugado al regenerar)
//   s/<código>.json  silueta de cada pueblo que puede salir
//   espana.json      mapa de provincias para enseñar dónde estaba el pueblo al terminar
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { PUEBLOS } from './pueblos.mjs';
import { PROVINCIAS, COMUNIDADES, normalizar, variantes } from '../public/juego.js';

const [entrada, salida] = process.argv.slice(2);
if (!entrada || !salida) { console.error('Uso: node scripts/datos.mjs <municipalities.json> <carpeta-salida>'); process.exit(2); }
const topo = JSON.parse(readFileSync(entrada, 'utf8'));
const INICIO = '2026-11-26';

// ---------- TopoJSON → coordenadas ----------
const tr = topo.transform;
const arcos = topo.arcs.map((arco) => {
  let x = 0, y = 0;
  return arco.map((p) => {
    if (tr) { x += p[0]; y += p[1]; return [x * tr.scale[0] + tr.translate[0], y * tr.scale[1] + tr.translate[1]]; }
    return [p[0], p[1]];
  });
});
function anillo(indices) {
  const pts = [];
  for (const i of indices) {
    const a = i < 0 ? [...arcos[~i]].reverse() : arcos[i];
    pts.push(...(pts.length ? a.slice(1) : a));
  }
  return pts;
}
function poligonos(g) {
  if (g.type === 'Polygon') return [g.arcs.map(anillo)];
  if (g.type === 'MultiPolygon') return g.arcs.map((p) => p.map(anillo));
  return [];
}

const objetoMun = topo.objects.municipalities || Object.values(topo.objects).find((o) => o.geometries?.length > 5000);
if (!objetoMun) throw new Error(`No encuentro los municipios. Objetos disponibles: ${Object.keys(topo.objects).join(', ')}`);

// ---------- Geometría ----------
const area = (r) => { let s = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) s += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return s / 2; };
function centroide(r) {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const f = r[j][0] * r[i][1] - r[i][0] * r[j][1];
    a += f; cx += (r[j][0] + r[i][0]) * f; cy += (r[j][1] + r[i][1]) * f;
  }
  if (!a) return r[0];
  return [cx / (3 * a), cy / (3 * a)];
}
function simplificar(pts, tol) { // Douglas-Peucker
  if (pts.length < 4) return pts;
  const conservar = new Uint8Array(pts.length); conservar[0] = conservar[pts.length - 1] = 1;
  const pila = [[0, pts.length - 1]];
  while (pila.length) {
    const [a, b] = pila.pop();
    let max = 0, idx = -1;
    const [x1, y1] = pts[a], [x2, y2] = pts[b];
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    for (let i = a + 1; i < b; i++) {
      // Anillos cerrados: el primer y el último punto coinciden, así que se mide la distancia a ese punto.
      const d = len < 1e-9 ? Math.hypot(pts[i][0] - x1, pts[i][1] - y1) : Math.abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / len;
      if (d > max) { max = d; idx = i; }
    }
    if (max > tol) { conservar[idx] = 1; pila.push([a, idx], [idx, b]); }
  }
  return pts.filter((_, i) => conservar[i]);
}
const r1 = (n) => Math.round(n * 10) / 10;
const KM_GRADO = 111.32;

// ---------- Municipios ----------
const municipios = [];
const geometrias = new Map();
for (const g of objetoMun.geometries) {
  const codigo = String(g.id ?? g.properties?.INE ?? '').padStart(5, '0');
  const prov = codigo.slice(0, 2);
  const nombre = g.properties?.name || g.properties?.NAMEUNIT || g.properties?.nombre;
  if (!/^\d{5}$/.test(codigo) || !PROVINCIAS[prov] || !nombre) continue; // condominios y zonas sin municipio
  const polis = poligonos(g).filter((p) => p[0]?.length > 2);
  if (!polis.length) continue;
  // Centro: el de la parte más grande (las islas o enclaves no lo desplazan fuera del pueblo).
  const mayor = polis.reduce((m, p) => (Math.abs(area(p[0])) > Math.abs(area(m[0])) ? p : m));
  const [lon, lat] = centroide(mayor[0]);
  municipios.push([codigo, nombre, prov, Math.round(lat * 1e4) / 1e4, Math.round(lon * 1e4) / 1e4]);
  geometrias.set(codigo, polis);
}
municipios.sort((a, b) => a[1].localeCompare(b[1], 'es'));
if (municipios.length < 50) throw new Error(`Solo hay ${municipios.length} municipios: los datos de entrada no parecen correctos.`);

// ---------- Pueblos que pueden salir ----------
const indice = new Map();
for (const m of municipios) for (const v of variantes(m[1])) indice.set(`${m[2]}:${v}`, m[0]);
const elegibles = [];
const noEncontrados = [];
for (const p of PUEBLOS) {
  const codigo = p.nombres.flatMap((n) => variantes(n)).map((v) => indice.get(`${p.prov}:${v}`)).find(Boolean);
  if (codigo) { if (!elegibles.includes(codigo)) elegibles.push(codigo); } else noEncontrados.push(`${p.nombres[0]} (${p.prov})`);
}

// ---------- Siluetas ----------
mkdirSync(path.join(salida, 's'), { recursive: true });
for (const f of readdirSync(path.join(salida, 's'))) rmSync(path.join(salida, 's', f));
for (const codigo of elegibles) {
  const polis = geometrias.get(codigo);
  const lat0 = municipios.find((m) => m[0] === codigo)[3] * Math.PI / 180;
  const k = Math.cos(lat0);
  const proy = polis.map((p) => p.map((r) => r.map(([lo, la]) => [lo * k, -la])));
  // Quita islotes diminutos (menos del 0,5 % de la parte mayor).
  const areas = proy.map((p) => Math.abs(area(p[0])));
  const maxA = Math.max(...areas);
  const partes = proy.filter((_, i) => areas[i] >= maxA * 0.005);
  const todos = partes.flat(2);
  const minX = Math.min(...todos.map((p) => p[0])), maxX = Math.max(...todos.map((p) => p[0]));
  const minY = Math.min(...todos.map((p) => p[1])), maxY = Math.max(...todos.map((p) => p[1]));
  const esc = 100 / Math.max(maxX - minX, maxY - minY);
  const w = r1((maxX - minX) * esc), h = r1((maxY - minY) * esc);
  let d = '';
  for (const p of partes) for (const r of p) {
    const s = simplificar(r.map(([x, y]) => [(x - minX) * esc, (y - minY) * esc]), 0.12);
    if (s.length < 3) continue;
    d += `M${s.map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L')}Z`;
  }
  const km2 = Math.round(partes.reduce((sum, p) => sum + p.reduce((s2, r, i) => s2 + (i ? -1 : 1) * Math.abs(area(r)), 0), 0) * KM_GRADO * KM_GRADO);
  writeFileSync(path.join(salida, 's', `${codigo}.json`), JSON.stringify({ d, w, h, km2 }));
}

// ---------- Orden de las partidas (lo ya jugado no cambia) ----------
function mezclar(lista, semilla) {
  const a = [...lista].sort();
  let s = semilla >>> 0;
  const rnd = () => { s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9) >>> 0; s ^= s >>> 13; return (s >>> 0) / 4294967296; };
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const rutaPartidas = path.join(salida, 'partidas.json');
const hoy = new Date().toISOString().slice(0, 10);
const jugadas = Math.max(0, Math.round((Date.parse(hoy) - Date.parse(INICIO)) / 864e5)) + 15; // hoy y dos semanas por delante, fijos
let orden = [];
if (existsSync(rutaPartidas)) {
  const previo = JSON.parse(readFileSync(rutaPartidas, 'utf8'));
  if (previo.inicio === INICIO) orden = previo.orden.slice(0, jugadas);
}
const resto = mezclar(elegibles.filter((c) => !orden.includes(c)), 20261126 + orden.length);
// Evita que salgan dos pueblos de la misma provincia dos días seguidos.
for (const c of resto) orden.push(c);
for (let i = Math.max(1, jugadas); i < orden.length; i++) {
  if (orden[i].slice(0, 2) === orden[i - 1].slice(0, 2)) {
    const j = orden.findIndex((x, k) => k > i && x.slice(0, 2) !== orden[i - 1].slice(0, 2));
    if (j > 0) [orden[i], orden[j]] = [orden[j], orden[i]];
  }
}
orden = orden.filter((c) => elegibles.includes(c) || orden.indexOf(c) < jugadas);
writeFileSync(rutaPartidas, JSON.stringify({ inicio: INICIO, orden }));

// ---------- Mapa de España (provincias) ----------
const objetoProv = topo.objects.provinces;
if (objetoProv) {
  const K = 30, COS = Math.cos(40 * Math.PI / 180);
  const CANARIAS = { dx: 8.7, dy: 6.0 }; // recuadro de Canarias al suroeste, debajo de Portugal
  const P = (lon, lat) => {
    if (lat < 30 && lon < -12) { lon += CANARIAS.dx; lat += CANARIAS.dy; }
    return [(lon + 9.6) * COS * K, (44 - lat) * K];
  };
  let d = '';
  for (const g of objetoProv.geometries) {
    for (const p of poligonos(g)) {
      const r = p[0].map(([lo, la]) => P(lo, la));
      if (Math.abs(area(r)) < 4) continue;
      const s = simplificar(r, 0.6);
      d += `M${s.map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L')}Z`;
    }
  }
  const [x1, y1] = P(-18.3, 29.5), [x2, y2] = P(-13.3, 27.5);
  writeFileSync(path.join(salida, 'espana.json'), JSON.stringify({ d, w: r1((4.6 + 9.6) * COS * K), h: r1((44 - 33.2) * K), K, COS, CANARIAS, marco: [r1(x1 - 6), r1(y1 - 6), r1(x2 + 6), r1(y2 + 6)] }));
}

writeFileSync(path.join(salida, 'municipios.json'), JSON.stringify({ v: 1, generado: hoy, m: municipios }));
console.log(`Municipios: ${municipios.length}. Pueblos del día: ${elegibles.length} (para ${orden.length} días).`);
if (noEncontrados.length) console.log(`No encontrados en los datos oficiales (${noEncontrados.length}): ${noEncontrados.join(', ')}`);
