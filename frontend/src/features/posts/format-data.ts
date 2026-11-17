/**
 * Formata uma data ISO para "dd/mm/aaaa às hh:mm" (pt-BR).
 * Retorna string vazia se a data for ausente ou inválida.
 */
export function formatarDataHora(iso?: string): string {
  if (!iso) return ''
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return ''

  const dia = data.toLocaleDateString('pt-BR')
  const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${dia} às ${hora}`
}
