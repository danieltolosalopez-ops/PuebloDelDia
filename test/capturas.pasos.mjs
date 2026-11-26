// Capturas para Google Play y App Store. Necesita los datos reales en public/datos (los genera GitHub).
// Uso: bash test/capturas.sh public test/capturas.pasos.mjs store
export default async ({ ir, js, captura, clic, escribir, esperar }) => {
  await ir(''); await js('localStorage.clear(); true'); await ir(''); await esperar(800);
  await js("document.querySelector('#dlg-ayuda').close()");
  await captura('01-silueta');
  const objetivo = await js("fetch('datos/partidas.json').then(r => r.json()).then(p => p.orden[(Math.floor((Date.now() - Date.parse('2026-11-26T00:00:00')) / 864e5)) % p.orden.length])");
  const mun = await js("fetch('datos/municipios.json').then(r => r.json()).then(d => d.m)");
  const obj = mun.find((m) => m[0] === objetivo);
  // Tres intentos lejanos para que se vean flechas, distancias y pistas
  const candidatos = ['Barcelona', 'Sevilla', 'Bilbao', 'Valencia', 'Zaragoza', 'Vigo', 'Badajoz'].filter((n) => !obj[1].includes(n));
  for (const n of candidatos.slice(0, 3)) {
    await escribir('#entrada', n); await esperar(200);
    await js("document.querySelector('#form-adivinar').requestSubmit()"); await esperar(400);
  }
  await js('scrollTo(0, 0); true');
  await captura('02-pistas');
  await escribir('#entrada', obj[1].split('/')[0].replace(/, (El|La|A|Las|Los|O|L')$/, ''));
  await esperar(250);
  await js("document.querySelector('#form-adivinar').requestSubmit()");
  await esperar(1800);
  await js("document.querySelector('#final').scrollIntoView(); scrollBy(0, -8); true");
  await esperar(600);
  await captura('03-mapa');
  await clic('#btn-estadisticas'); await esperar(400);
  await captura('04-estadisticas');
};
