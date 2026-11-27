// Recorrido del juego en un móvil simulado, con los datos de prueba (test/fixture.mjs).
export default async ({ ir, js, captura, clic, escribir, esperar }) => {
  await ir('');
  await js("localStorage.clear(); true");
  await ir('');
  await esperar(500);
  await captura('01-ayuda');
  await js("document.querySelector('#dlg-ayuda').close()");
  await captura('02-inicio');
  // El pueblo de hoy, calculado igual que la app (no siempre es el primero de la lista).
  const objetivo = await js(`Promise.all([import(new URL('juego.js', location.href).href), fetch('datos/partidas.json').then(r => r.json())])
    .then(([j, p]) => { const a = new Date(), d = (n) => String(n).padStart(2, '0');
      return j.codigoDelDia(j.numeroDelDia(a.getFullYear() + '-' + d(a.getMonth() + 1) + '-' + d(a.getDate())), p.orden); })`);
  const mun = await js("fetch('datos/municipios.json').then(r => r.json()).then(d => d.m)");
  const nombre = (c) => mun.find((m) => m[0] === c)[1];
  const fallos = ['Barcelona', 'Sevilla', 'Palma', 'Toledo'].filter((n) => n !== nombre(objetivo)).slice(0, 3);
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
  // El nombre grande del final solo puede pasar de línea en un espacio, un guion o una barra
  // (nombres dobles como «Peníscola/Peñíscola»), nunca a mitad de palabra.
  const corte = await js(`(() => {
    const h = document.querySelector('.nombre-pueblo'), r = document.createRange();
    const tw = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
    let prev = null, top = null, n;
    while ((n = tw.nextNode())) for (let i = 0; i < n.length; i++) {
      const ch = n.data[i];
      if (ch === ' ') { prev = ch; continue; }
      r.setStart(n, i); r.setEnd(n, i + 1);
      const t = r.getBoundingClientRect().top;
      if (top !== null && t > top + 5 && prev !== ' ' && prev !== '/' && prev !== '-') return prev + ' | ' + ch;
      top = t; prev = ch;
    }
    return '';
  })()`);
  if (corte) throw new Error('El nombre del pueblo se parte a mitad de palabra: ' + corte);
  await clic('#btn-estadisticas');
  await captura('05-estadisticas');
  const racha = await js("JSON.parse(localStorage.getItem('pd.est')).racha");
  if (racha !== 1) throw new Error('La racha debería ser 1');
  // Al volver a abrir, la partida terminada se mantiene
  await ir('');
  if (await js("document.querySelector('#final').hidden")) throw new Error('Al recargar se pierde la partida terminada');
  // Si cambia el día con la app abierta en segundo plano, al volver a ella se carga el pueblo nuevo.
  await js(`window.__sinRecargar = true; const D = Date;
    window.Date = class extends D { constructor(...a) { super(...(a.length ? a : [D.now() + 864e5])); } static now() { return D.now() + 864e5; } };
    document.dispatchEvent(new Event('visibilitychange')); true`);
  await esperar(1500);
  if (await js('window.__sinRecargar === true')) throw new Error('Al cambiar de día no se carga el pueblo nuevo');
};
