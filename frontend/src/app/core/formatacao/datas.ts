const dataHora = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});
const data = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const dataCurta = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
const hora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const diaSemanaCurto = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });
const diaSemanaCompleto = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
const mesAno = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
const relativo = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

export const SEM_REGISTRO = '—';

function converter(valor: string | Date | null | undefined): Date | null {
  if (!valor) return null;
  const convertido = valor instanceof Date ? valor : new Date(valor);
  return Number.isNaN(convertido.getTime()) ? null : convertido;
}

function formatar(formatador: Intl.DateTimeFormat, valor: string | Date | null | undefined, vazio = SEM_REGISTRO) {
  const convertido = converter(valor);
  return convertido ? formatador.format(convertido) : vazio;
}

export const formatarDataHora = (valor: string | Date | null | undefined, vazio?: string) => formatar(dataHora, valor, vazio);
export const formatarData = (valor: string | Date | null | undefined, vazio?: string) => formatar(data, valor, vazio);
export const formatarDataCurta = (valor: string | Date | null | undefined, vazio?: string) => formatar(dataCurta, valor, vazio).replace('.', '');
export const formatarHora = (valor: string | Date | null | undefined, vazio?: string) => formatar(hora, valor, vazio);
export const formatarDiaSemanaCurto = (valor: string | Date) => formatar(diaSemanaCurto, valor).replace('.', '');
export const formatarDiaCompleto = (valor: string | Date) => formatar(diaSemanaCompleto, valor);
export const formatarMesAno = (valor: string | Date) => formatar(mesAno, valor);

const diaMesLongo = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' });
const diaMesCurto = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' });

/** "12 a 18 de outubro de 2026" ou "28 de set. a 4 de out. de 2026". */
export function formatarPeriodo(inicio: Date, fim: Date) {
  const ano = fim.getFullYear();
  if (inicio.getMonth() === fim.getMonth() && inicio.getFullYear() === fim.getFullYear()) {
    return `${inicio.getDate()} a ${diaMesLongo.format(fim)} de ${ano}`;
  }
  return `${diaMesCurto.format(inicio).replace('.', '')} a ${diaMesCurto.format(fim).replace('.', '')} de ${ano}`;
}

export function formatarIntervaloHora(inicio: string | Date, fim: string | Date) {
  return `${formatarHora(inicio)} – ${formatarHora(fim)}`;
}

/** "ha 3 horas", "amanha", "em 2 dias"; para listas de notificacoes e eventos. */
export function formatarTempoRelativo(valor: string | Date | null | undefined, agora = new Date()) {
  const convertido = converter(valor);
  if (!convertido) return SEM_REGISTRO;
  const minutos = Math.round((convertido.getTime() - agora.getTime()) / 60_000);
  const absoluto = Math.abs(minutos);
  if (absoluto < 1) return 'agora';
  if (absoluto < 60) return relativo.format(minutos, 'minute');
  if (absoluto < 60 * 24) return relativo.format(Math.round(minutos / 60), 'hour');
  if (absoluto < 60 * 24 * 7) return relativo.format(Math.round(minutos / (60 * 24)), 'day');
  return formatarData(convertido);
}

export function inicioDoDia(referencia: Date = new Date()) {
  const inicio = new Date(referencia);
  inicio.setHours(0, 0, 0, 0);
  return inicio;
}

export function adicionarDias(referencia: Date, dias: number) {
  const resultado = new Date(referencia);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}

export function mesmoDia(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Semana de domingo a sabado que contem a referencia (fim exclusivo). */
export function periodoDaSemana(referencia: Date = new Date()) {
  const inicio = inicioDoDia(referencia);
  inicio.setDate(inicio.getDate() - inicio.getDay());
  const fim = adicionarDias(inicio, 7);
  return { inicio, fim };
}

export function periodoDoDia(referencia: Date = new Date()) {
  const inicio = inicioDoDia(referencia);
  return { inicio, fim: adicionarDias(inicio, 1) };
}

export function diasDoPeriodo(inicio: Date, quantidade: number) {
  return Array.from({ length: quantidade }, (_, indice) => adicionarDias(inicio, indice));
}

const preencher = (valor: number) => String(valor).padStart(2, '0');

/** Valor aceito por <input type="date">. */
export function paraCampoData(valor: Date) {
  return `${valor.getFullYear()}-${preencher(valor.getMonth() + 1)}-${preencher(valor.getDate())}`;
}

/** Valor aceito por <input type="time">. */
export function paraCampoHora(valor: Date) {
  return `${preencher(valor.getHours())}:${preencher(valor.getMinutes())}`;
}

/** Valor aceito por <input type="datetime-local">. */
export function paraCampoDataHora(valor: Date) {
  return `${paraCampoData(valor)}T${paraCampoHora(valor)}`;
}

export function minutosDoDia(valor: Date) {
  return valor.getHours() * 60 + valor.getMinutes();
}
