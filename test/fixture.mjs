// Crea un TopoJSON pequeño con la misma forma que el de es-atlas para probar el generador sin internet.
// Uso: node test/fixture.mjs <salida.json>
import { writeFileSync } from 'node:fs';

const municipios = [
  ['28079', 'Madrid', 40.42, -3.70, 0.12], ['28065', 'Getafe', 40.30, -3.73, 0.05], ['45168', 'Toledo', 39.86, -4.02, 0.08],
  ['16078', 'Cuenca', 40.07, -2.13, 0.2], ['35016', 'Palmas de Gran Canaria, Las', 28.10, -15.43, 0.07],
  ['15030', 'Coruña, A', 43.36, -8.41, 0.04], ['20069', 'Donostia/San Sebastián', 43.31, -1.98, 0.05],
  ['08019', 'Barcelona', 41.39, 2.17, 0.07], ['41091', 'Sevilla', 37.39, -5.98, 0.09], ['07040', 'Palma', 39.57, 2.65, 0.1],
];
// Relleno: 60 municipios ficticios en una rejilla por Castilla para superar el mínimo del generador.
for (let i = 0; i < 60; i++) municipios.push([`47${String(100 + i).padStart(3, '0')}`, `Villaprueba ${i}`, 41.2 + (i % 10) * 0.08, -5.2 + Math.floor(i / 10) * 0.1, 0.035]);

const scale = [0.0001, 0.0001], translate = [-19, 27];
const q = ([lon, lat]) => [Math.round((lon - translate[0]) / scale[0]), Math.round((lat - translate[1]) / scale[1])];
const arcs = [];
function arco(puntos) { // codifica en deltas como hace topoquantize
  const qs = puntos.map(q);
  const d = qs.map((p, i) => (i ? [p[0] - qs[i - 1][0], p[1] - qs[i - 1][1]] : p));
  arcs.push(d);
  return arcs.length - 1;
}
// Polígono irregular (con una muesca) alrededor del centro; Cuenca lleva además un islote.
function forma(lat, lon, r) {
  const pts = [];
  for (let k = 0; k <= 12; k++) {
    const a = (k / 12) * 2 * Math.PI, rr = r * (k % 4 === 2 ? 0.6 : 1);
    pts.push([lon + rr * Math.cos(a) / Math.cos(lat * Math.PI / 180), lat + rr * Math.sin(a)]);
  }
  pts[pts.length - 1] = pts[0];
  return pts;
}
const geometries = municipios.map(([id, name, lat, lon, r]) => {
  if (id === '16078') return { type: 'MultiPolygon', id, properties: { name }, arcs: [[[arco(forma(lat, lon, r))]], [[arco(forma(lat + 0.3, lon + 0.3, 0.02))]]] };
  return { type: 'Polygon', id, properties: { name }, arcs: [[arco(forma(lat, lon, r))]] };
});
// Condominio (sin provincia real): el generador debe ignorarlo.
geometries.push({ type: 'Polygon', id: '53001', properties: { name: 'Comunidad de Prueba' }, arcs: [[arco(forma(41, -4, 0.02))]] });
const provincias = [['28', 40.4, -3.7, 0.6], ['45', 39.8, -4.0, 0.7], ['35', 28.1, -15.5, 0.5], ['08', 41.6, 2.0, 0.6]].map(([id, lat, lon, r]) => ({
  type: 'Polygon', id, properties: { name: `Provincia ${id}` }, arcs: [[arco(forma(lat, lon, r))]],
}));
const topo = { type: 'Topology', transform: { scale, translate }, arcs, objects: { municipalities: { type: 'GeometryCollection', geometries }, provinces: { type: 'GeometryCollection', geometries: provincias } } };
writeFileSync(process.argv[2], JSON.stringify(topo));
