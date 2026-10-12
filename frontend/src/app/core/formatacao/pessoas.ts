export function iniciaisNome(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return 'GP';
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? (partes.at(-1)?.[0] ?? '') : '';
  return `${primeira}${ultima}`.toLocaleUpperCase('pt-BR');
}

export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}

export function formatarCpf(valor: string | null | undefined): string {
  if (!valor) return '';
  if (valor.includes('*')) return valor;
  const digitos = valor.replace(/\D/g, '').slice(0, 11);
  if (!digitos) return '';
  return digitos
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

export function formatarTelefone(valor: string | null | undefined): string {
  const digitos = valor?.replace(/\D/g, '').slice(0, 11) ?? '';
  if (!digitos) return '';
  return digitos.length > 10
    ? digitos.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3')
    : digitos.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
}

/** CRP no padrao 06/123456, com o cursor tolerante a edicao no meio do texto. */
export function formatarCrp(valor: string): string {
  const digitos = valor.replace(/\D/g, '');
  return digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2, 8)}` : digitos;
}

export function textoOuPadrao(valor: string | null | undefined, padrao: string): string {
  return valor?.trim() ? valor : padrao;
}
