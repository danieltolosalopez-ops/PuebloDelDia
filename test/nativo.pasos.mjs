// Comportamiento de la app nativa: aviso diario, compartir y botón Atrás.
export default async ({ ir, js, clic, esperar }) => {
  await ir(''); await js('localStorage.clear(); true'); await ir(''); await esperar(500);
  await js('window.__atras()'); await esperar(200);
  if (await js("document.querySelector('#dlg-ayuda').open")) throw new Error('Atrás no cierra la ayuda');
  await clic('#btn-estadisticas');
  if (await js("document.querySelector('#fila-aviso').hidden")) throw new Error('No aparece el aviso diario en la app');
  await clic('#aviso-diario'); await esperar(400);
  const a = await js("JSON.parse(localStorage.getItem('__avisos') || '[]')");
  if (a.length !== 1 || a[0].schedule?.on?.hour !== 9) throw new Error('Aviso diario mal programado: ' + JSON.stringify(a));
  await js('window.__atras()'); await esperar(200);
  await js('window.__atras()'); await esperar(200);
  if (!(await js("JSON.parse(localStorage.getItem('__llamadas')).some(l => l[1] === 'exitApp')"))) throw new Error('Atrás no sale de la app');
};
