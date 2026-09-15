/**
 * Utilitário de teste: monta um JWT "fake" (header.payload.assinatura) a
 * partir de um payload arbitrário, sem assinatura real — suficiente para
 * exercitar código que apenas decodifica o payload (ex.: `auth-context`).
 */
export function criarTokenFake(payload: Record<string, unknown>): string {
  const paraBase64Url = (valor: Record<string, unknown>) =>
    btoa(JSON.stringify(valor))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

  return `${paraBase64Url({ alg: 'HS256', typ: 'JWT' })}.${paraBase64Url(payload)}.assinatura-fake`
}
