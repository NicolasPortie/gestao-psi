// Mede contraste WCAG dos pares de tokens declarados em tokens.css (OKLCH -> sRGB).
// Uso: npm run contraste (a partir de frontend/). Sai com código 1 se algum par falhar.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const css = readFileSync(fileURLToPath(new URL('../src/app/styles/tokens.css', import.meta.url)), 'utf8');

function blocoTema(seletor) {
  const ini = css.indexOf(seletor);
  const abre = css.indexOf('{', ini);
  let nivel = 0;
  let i = abre;
  for (; i < css.length; i += 1) {
    if (css[i] === '{') nivel += 1;
    if (css[i] === '}') { nivel -= 1; if (nivel === 0) break; }
  }
  return css.slice(abre + 1, i);
}

function lerTokens(bloco) {
  const mapa = {};
  for (const m of bloco.matchAll(/--([a-z-]+):\s*oklch\(([^)]+)\)/g)) {
    const [parte] = m[2].split('/');
    const [l, c, h] = parte.trim().split(/\s+/).map(Number);
    mapa[m[1]] = { l, c, h, alfa: m[2].includes('/') ? Number(m[2].split('/')[1]) : 1 };
  }
  return mapa;
}

function oklchParaSrgb({ l, c, h }) {
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
  return lin.map((v) => Math.min(1, Math.max(0, v)));
}

function luminancia(cor) {
  const [r, g, b] = oklchParaSrgb(cor);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(a, b) {
  const la = luminancia(a);
  const lb = luminancia(b);
  const [x, y] = la > lb ? [la, lb] : [lb, la];
  return (x + 0.05) / (y + 0.05);
}

function hex(cor) {
  const rgb = oklchParaSrgb(cor).map((v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055));
  return `#${rgb.map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('')}`;
}

const pares = [
  // [texto, fundo, minimo, descricao]
  ['ink', 'paper', 7, 'texto principal'],
  ['ink', 'rail', 7, 'texto no trilho'],
  ['ink', 'selected', 7, 'texto em selecao'],
  ['ink', 'hover', 7, 'texto em hover'],
  ['ink-muted', 'paper', 4.5, 'texto secundario'],
  ['ink-muted', 'rail', 4.5, 'secundario no trilho'],
  ['ink-muted', 'hover', 4.5, 'secundario em hover'],
  ['ink-muted', 'selected', 4.5, 'secundario em selecao'],
  ['ink-faint', 'paper', 4.5, 'placeholder / dica'],
  ['ink-faint', 'field', 4.5, 'placeholder no campo'],
  ['on-accent', 'accent', 4.5, 'texto sobre botao'],
  ['on-accent', 'accent-hover', 4.5, 'texto sobre botao (hover)'],
  ['accent-ink', 'paper', 4.5, 'link / texto de acento'],
  ['accent-ink', 'accent-wash', 4.5, 'texto de acento sobre tinta'],
  ['accent-ink', 'rail', 4.5, 'texto de acento no trilho'],
  ['danger-ink', 'danger-wash', 4.5, 'erro sobre fundo'],
  ['danger-ink', 'paper', 4.5, 'erro sobre papel'],
  ['warning-ink', 'warning-wash', 4.5, 'aviso sobre fundo'],
  ['warning-ink', 'paper', 4.5, 'aviso sobre papel'],
  ['success-ink', 'success-wash', 4.5, 'sucesso sobre fundo'],
  ['success-ink', 'paper', 4.5, 'sucesso sobre papel'],
  ['on-accent', 'danger', 4.5, 'texto sobre botao destrutivo'],
  ['line-strong', 'field', 3, 'borda de controle'],
  ['line-strong', 'paper', 3, 'borda de controle no papel'],
  ['ink', 'surface', 7, 'texto em painel'],
  ['ink-muted', 'surface', 4.5, 'secundario em painel'],
  ['ink-faint', 'surface', 4.5, 'dica em painel'],
  ['accent-ink', 'surface', 4.5, 'acento em painel'],
  ['line-strong', 'surface', 3, 'borda de controle em painel'],
  ['ink-muted', 'pressed', 4.5, 'secundario em pilula neutra'],
  ['accent', 'accent-wash', 3, 'marca de acento na pilula'],
  ['success', 'success-wash', 3, 'marca de sucesso na pilula'],
  ['warning', 'warning-wash', 3, 'marca de aviso na pilula'],
  ['danger', 'danger-wash', 3, 'marca de perigo na pilula'],
  ['focus', 'paper', 3, 'anel de foco'],
  ['accent', 'paper', 3, 'marca de acento (nao textual)'],
  ['danger', 'paper', 3, 'marca de perigo (nao textual)'],
  ['warning', 'paper', 3, 'marca de aviso (nao textual)'],
  ['success', 'paper', 3, 'marca de sucesso (nao textual)'],
];

let falhas = 0;
for (const [seletor, nome] of [[':root,', 'CLARO'], [":root[data-tema='escuro']", 'ESCURO']]) {
  const tokens = lerTokens(blocoTema(seletor));
  console.log(`\n== ${nome} ==`);
  for (const [fg, bg, minimo, desc] of pares) {
    if (!tokens[fg] || !tokens[bg]) { console.log(`   ?  ${fg}/${bg} ausente`); continue; }
    const razao = contraste(tokens[fg], tokens[bg]);
    const ok = razao >= minimo;
    if (!ok) falhas += 1;
    console.log(`${ok ? ' ok' : 'FALHA'}  ${razao.toFixed(2).padStart(5)}  (min ${minimo})  ${fg} sobre ${bg}  [${hex(tokens[fg])} / ${hex(tokens[bg])}]  ${desc}`);
  }
}
console.log(`\n${falhas === 0 ? 'Todos os pares passam.' : `${falhas} par(es) abaixo do minimo.`}`);
process.exit(falhas === 0 ? 0 : 1);
