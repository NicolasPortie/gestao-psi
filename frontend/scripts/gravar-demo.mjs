#!/usr/bin/env node
/**
 * Grava o GIF de demonstração do README (docs/screenshots/demo.gif) percorrendo as telas principais
 * com a conta criada por `npm run seed:demo`. Exige API e front ativos, além do ffmpeg no PATH.
 *
 *   npm run gravar:demo
 *   BASE_URL=http://localhost:4200 npm run gravar:demo
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:4200';
const EMAIL = process.env.DEMO_EMAIL ?? 'helena.duarte@demo.psique.local';
const SENHA = process.env.DEMO_SENHA ?? 'DemoPsique#2026';
const SAIDA = resolve(import.meta.dirname, '../../docs/screenshots/demo.gif');
const LARGURA = 1280;
const ALTURA = 800;
const LARGURA_GIF = 1000;
const QUADROS_POR_SEGUNDO = 15;

if (!/localhost|127\.0\.0\.1/.test(BASE)) {
  console.error(`Recusado: ${BASE} não é um endereço local.`);
  process.exit(1);
}

/** Cursor desenhado na página: a captura de tela do navegador não inclui o ponteiro do sistema. */
function instalarCursor() {
  const montar = () => {
    if (document.getElementById('cursor-demo')) return;
    const cursor = document.createElement('div');
    cursor.id = 'cursor-demo';
    cursor.innerHTML =
      '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M4 2.5v17.2l4.6-4.4 2.9 6.6 3-1.3-2.9-6.5h6.3z" fill="#fff" stroke="#1d1d1b" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    Object.assign(cursor.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      zIndex: '2147483647',
      pointerEvents: 'none',
      transformOrigin: '4px 2px',
      filter: 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.3))',
      transition: 'scale 120ms ease-out',
    });
    const [x, y] = JSON.parse(sessionStorage.getItem('cursor-demo') ?? `[${innerWidth / 2},${innerHeight / 2}]`);
    cursor.style.translate = `${x - 4}px ${y - 2}px`;
    document.body.append(cursor);
    addEventListener('mousemove', (evento) => {
      cursor.style.translate = `${evento.clientX - 4}px ${evento.clientY - 2}px`;
      sessionStorage.setItem('cursor-demo', JSON.stringify([evento.clientX, evento.clientY]));
    }, true);
    addEventListener('mousedown', () => (cursor.style.scale = '0.82'), true);
    addEventListener('mouseup', () => (cursor.style.scale = '1'), true);
  };
  if (document.body) montar();
  else document.addEventListener('DOMContentLoaded', montar);
}

const pausa = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

const navegador = await chromium.launch();
const contexto = await navegador.newContext({
  viewport: { width: LARGURA, height: ALTURA },
  deviceScaleFactor: 1,
  locale: 'pt-BR',
  timezoneId: 'America/Sao_Paulo',
  colorScheme: 'light',
});
await contexto.addInitScript(() => {
  if (!localStorage.getItem('psique:tema')) localStorage.setItem('psique:tema', 'claro');
});
await contexto.addInitScript(instalarCursor);
const pagina = await contexto.newPage();

await pagina.goto(`${BASE}/login`);
await pagina.getByLabel('E-mail').fill(EMAIL);
await pagina.getByLabel('Senha', { exact: true }).fill(SENHA);
await pagina.getByRole('button', { name: 'Entrar' }).click();
await pagina.waitForURL(/\/painel$/);
await pagina.waitForLoadState('networkidle');

// Visita prévia: carrega o código e os dados de cada tela para a gravação não mostrar esqueletos.
const areas = pagina.getByRole('navigation', { name: 'Áreas do consultório' });
for (const area of ['Agenda', 'Pacientes', 'Financeiro']) {
  await areas.getByRole('link', { name: area }).click();
  await pagina.waitForLoadState('networkidle');
  if (area === 'Pacientes') {
    await pagina.getByRole('main').getByRole('link', { name: /Ana Luíza Silveira/ }).first().click();
    await pagina.waitForLoadState('networkidle');
  }
}
await areas.getByRole('link', { name: 'Hoje' }).click();
await pagina.waitForLoadState('networkidle');
await pagina.mouse.move(LARGURA * 0.55, ALTURA * 0.5);
await pausa(800);

let cursor = { x: LARGURA * 0.55, y: ALTURA * 0.5 };

async function moverAte(alvo) {
  await alvo.waitFor();
  const caixa = await alvo.boundingBox();
  const destino = { x: caixa.x + Math.min(caixa.width / 2, 60), y: caixa.y + caixa.height / 2 };
  const distancia = Math.hypot(destino.x - cursor.x, destino.y - cursor.y);
  await pagina.mouse.move(destino.x, destino.y, { steps: Math.max(12, Math.round(distancia / 18)) });
  cursor = destino;
}

async function clicar(alvo, espera = 1800) {
  await moverAte(alvo);
  await pausa(180);
  await pagina.mouse.down();
  await pausa(90);
  await pagina.mouse.up();
  await pagina.waitForLoadState('networkidle');
  await pausa(espera);
}

const pasta = mkdtempSync(join(tmpdir(), 'psique-demo-'));
const quadros = [];
const cdp = await contexto.newCDPSession(pagina);
cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
  const arquivo = join(pasta, `q${String(quadros.length).padStart(5, '0')}.jpg`);
  writeFileSync(arquivo, Buffer.from(data, 'base64'));
  quadros.push({ arquivo, instante: metadata.timestamp });
  void cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => undefined);
});
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 95, maxWidth: LARGURA, maxHeight: ALTURA });
await pausa(2200);

const menu = pagina.getByRole('navigation', { name: 'Áreas do consultório' });
await clicar(menu.getByRole('link', { name: 'Agenda' }), 2600);
await clicar(menu.getByRole('link', { name: 'Pacientes' }), 1200);
await clicar(pagina.getByRole('main').getByRole('link', { name: /Ana Luíza Silveira/ }).first(), 2400);
await clicar(menu.getByRole('link', { name: 'Financeiro' }), 2400);
await clicar(pagina.getByRole('button', { name: /^Menu da conta de/ }), 700);
await clicar(pagina.getByRole('menuitem', { name: 'Tema escuro' }), 600);
await clicar(menu.getByRole('link', { name: 'Hoje' }), 2600);

const fim = Date.now() / 1000;
await cdp.send('Page.stopScreencast');
await navegador.close();

const lista = quadros.map(({ arquivo, instante }, indice) => {
  const proximo = quadros[indice + 1]?.instante ?? fim;
  return `file '${arquivo.replaceAll('\\', '/')}'\nduration ${Math.max(proximo - instante, 0.001).toFixed(3)}`;
});
lista.push(`file '${quadros.at(-1).arquivo.replaceAll('\\', '/')}'`);
const roteiro = join(pasta, 'quadros.txt');
writeFileSync(roteiro, lista.join('\n'));

execFileSync('ffmpeg', [
  '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', roteiro,
  '-vf',
  `fps=${QUADROS_POR_SEGUNDO},scale=${LARGURA_GIF}:-1:flags=lanczos,split[a][b];` +
    '[a]palettegen=stats_mode=diff:max_colors=192[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle',
  '-loop', '0', SAIDA,
], { stdio: 'inherit' });
rmSync(pasta, { recursive: true, force: true });
console.log(`GIF gravado em ${SAIDA} (${quadros.length} quadros capturados).`);
