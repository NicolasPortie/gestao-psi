// Gera os ícones PNG do app instalável (PWA) a partir de public/favicon.svg, a fonte da verdade do símbolo.
// Uso: node scripts/gerar-icones.mjs (a partir de frontend/). Usa o Chromium do Playwright, já instalado para os testes.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const svg = readFileSync(fileURLToPath(new URL('../public/favicon.svg', import.meta.url)), 'utf8');
const destino = (nome) => fileURLToPath(new URL(`../public/${nome}`, import.meta.url));

// "maskable": o sistema recorta o ícone em círculo ou gota; o símbolo fica na zona segura de 80%.
const alvos = [
  { nome: 'icone-192.png', tamanho: 192, margem: 0 },
  { nome: 'icone-512.png', tamanho: 512, margem: 0 },
  { nome: 'icone-mascaravel-512.png', tamanho: 512, margem: 0.12 },
];

const navegador = await chromium.launch();
try {
  for (const { nome, tamanho, margem } of alvos) {
    const pagina = await navegador.newPage({ viewport: { width: tamanho, height: tamanho } });
    const recuo = Math.round(tamanho * margem);
    await pagina.setContent(
      `<html><body style="margin:0;background:#23593d;display:grid;place-items:center;width:${tamanho}px;height:${tamanho}px">` +
        `<div style="width:${tamanho - recuo * 2}px;height:${tamanho - recuo * 2}px">${svg.replace('<svg', '<svg width="100%" height="100%"')}</div>` +
        '</body></html>',
    );
    await pagina.screenshot({ path: destino(nome), omitBackground: false });
    await pagina.close();
    console.log(`ok ${nome}`);
  }
} finally {
  await navegador.close();
}
