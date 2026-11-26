import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  distanciaKm, rumbo, flecha, direccion, evaluar, buscar, variantes, normalizar, numeroDelDia, codigoDelDia,
  textoCompartir, actualizarEstadisticas, cuadros, pistas,
} from '../public/juego.js';

const madrid = ['28079', 'Madrid', '28', 40.4168, -3.7038];
const barcelona = ['08019', 'Barcelona', '08', 41.3874, 2.1686];
const sevilla = ['41091', 'Sevilla', '41', 37.3891, -5.9845];

test('distancias y direcciones', () => {
  const d = distanciaKm([madrid[3], madrid[4]], [barcelona[3], barcelona[4]]);
  assert.ok(d > 495 && d < 510, `Madrid-Barcelona ${d}`);
  assert.equal(flecha(rumbo([madrid[3], madrid[4]], [barcelona[3], barcelona[4]])), '➡️'); // Barcelona queda casi al este
  assert.equal(direccion(rumbo([madrid[3], madrid[4]], [sevilla[3], sevilla[4]])), 'suroeste');
  const e = evaluar(madrid, sevilla);
  assert.equal(e.acierto, false);
  assert.ok(e.km > 380 && e.km < 400);
  assert.equal(evaluar(madrid, madrid).acierto, true);
});

test('nombres con artículo o en dos idiomas', () => {
  assert.ok(variantes('Coruña, A').includes('a coruna'));
  assert.ok(variantes('Donostia/San Sebastián').includes('san sebastian'));
  assert.ok(variantes("Hospitalet de Llobregat, L'").includes("l'hospitalet de llobregat"));
  assert.equal(normalizar('  Ávila '), 'avila');
  const lista = [['15030', 'Coruña, A', '15', 43.36, -8.41], ['20069', 'Donostia/San Sebastián', '20', 43.3, -1.98], ['28079', 'Madrid', '28', 40.4, -3.7]];
  assert.equal(buscar('coru', lista)[0][0], '15030');
  assert.equal(buscar('san seb', lista)[0][0], '20069');
  assert.equal(buscar('drid', lista)[0][0], '28079');
  assert.deepEqual(buscar('m', lista), []);
});

test('número del día y partida', () => {
  assert.equal(numeroDelDia('2026-11-26'), 1);
  assert.equal(numeroDelDia('2026-12-31'), 36);
  assert.equal(codigoDelDia(1, ['a', 'b', 'c']), 'a');
  assert.equal(codigoDelDia(4, ['a', 'b', 'c']), 'a');
});

test('compartir y estadísticas', () => {
  assert.equal(cuadros(100), '🟩🟩🟩🟩🟩');
  assert.equal(cuadros(45), '🟩🟩⬜⬜⬜');
  assert.equal(cuadros(55), '🟩🟩🟨⬜⬜');
  assert.equal(cuadros(71), '🟩🟩🟩🟨⬜');
  const t = textoCompartir(5, [evaluar(madrid, sevilla), evaluar(sevilla, sevilla)], true, 'https://x');
  assert.match(t, /^Pueblo del Día #5 2\/6/);
  assert.match(t, /🎉/);
  let e = actualizarEstadisticas({}, 5, true, 2);
  e = actualizarEstadisticas(e, 6, true, 3);
  assert.equal(e.racha, 2);
  assert.equal(actualizarEstadisticas(e, 6, true, 1).jugadas, 2); // el mismo día no cuenta dos veces
  e = actualizarEstadisticas(e, 8, true, 1);
  assert.equal(e.racha, 1);
  e = actualizarEstadisticas(e, 9, false, 6);
  assert.equal(e.racha, 0);
  assert.equal(e.mejor, 2);
  assert.deepEqual(e.reparto, [1, 1, 1, 0, 0, 0]);
  assert.equal(pistas(1, madrid, { km2: 604 }).length, 0);
  assert.equal(pistas(5, madrid, { km2: 604 }).length, 3);
});

test('generador de datos con un TopoJSON de prueba', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'pueblo-'));
  const topo = path.join(dir, 'municipalities.json');
  execFileSync('node', ['test/fixture.mjs', topo]);
  const salida = path.join(dir, 'datos');
  const log = execFileSync('node', ['scripts/datos.mjs', topo, salida]).toString();
  assert.match(log, /Municipios: 70/);
  const mun = JSON.parse(readFileSync(path.join(salida, 'municipios.json')));
  assert.equal(mun.m.length, 70); // el condominio se descarta
  const partidas = JSON.parse(readFileSync(path.join(salida, 'partidas.json')));
  for (const c of ['28079', '28065', '45168', '16078', '35016', '15030', '20069', '08019', '41091', '07040']) assert.ok(partidas.orden.includes(c), `falta ${c}`);
  const sil = JSON.parse(readFileSync(path.join(salida, 's', '16078.json')));
  assert.match(sil.d, /^M[\d.]+ [\d.]+L/);
  assert.equal((sil.d.match(/M/g) || []).length, 2); // Cuenca con su islote
  assert.ok(sil.w <= 100 && sil.h <= 100 && Math.max(sil.w, sil.h) > 99);
  assert.ok(sil.km2 > 100);
  assert.ok(existsSync(path.join(salida, 'espana.json')));
  // Regenerar no cambia los días ya fijados
  execFileSync('node', ['scripts/datos.mjs', topo, salida]);
  const otra = JSON.parse(readFileSync(path.join(salida, 'partidas.json')));
  assert.deepEqual(otra.orden.slice(0, 10), partidas.orden.slice(0, 10));
});
