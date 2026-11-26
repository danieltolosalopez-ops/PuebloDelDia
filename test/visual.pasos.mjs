// Recorrido del juego en un móvil simulado, con los datos de prueba (test/fixture.mjs).
export default async ({ ir, js, captura, clic, escribir, esperar }) => {
  await ir('');
  await js("localStorage.clear(); true");
  await ir('');
  await esperar(500);
  await captura('01-ayuda');
  await js("document.querySelector('#dlg-ayuda').close()");
  await captura('02-inicio');
  const objetivo = await js("fetch('datos/partidas.json').then(r => r.json()).then(p => p.orden[0])");
  const mun = await js("fetch('datos/municipios.json').then(r => r.json()).then(d => d.m)");
  const nombre = (c) => mun.find((m) => m[0] === c)[1];
  const fallos = ['Barcelona', 'Sevilla', 'Palma', 'Villaprueba 12'].filter((n) => n !== nombre(objetivo)).slice(0, 3);
  for (const f of fallos) {
    await escribir('#entrada', f);
    await esperar(200);
    await js("document.querySelector('#form-adivinar').requestSubmit()");
    await esperar(400);
  }
  await escribir('#entrada', 'coru');
  await esperar(200);
  await captura('03-jugando');
  const n = await js("document.querySelectorAll('#intentos li:not(.vacia)').length");
  if (n !== 3) throw new Error('Esperaba 3 intentos y hay ' + n);
  const pistas = await js("document.querySelectorAll('#pistas li').length");
  if (pistas < 2) throw new Error('Deberían verse pistas tras 3 fallos');
  await escribir('#entrada', nombre(objetivo).split('/')[0].replace(/, (El|La|A|Las)$/, ''));
  await esperar(200);
  await js("document.querySelector('#form-adivinar').requestSubmit()");
  await esperar(1500);
  await captura('04-final', true);
  if (await js("document.querySelector('#final').hidden")) throw new Error('No aparece la pantalla final');
  await clic('#btn-estadisticas');
  await captura('05-estadisticas');
  const racha = await js("JSON.parse(localStorage.getItem('pd.est')).racha");
  if (racha !== 1) throw new Error('La racha debería ser 1');
  // Al volver a abrir, la partida terminada se mantiene
  await ir('');
  if (await js("document.querySelector('#final').hidden")) throw new Error('Al recargar se pierde la partida terminada');
};
