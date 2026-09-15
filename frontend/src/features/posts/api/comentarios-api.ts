import { apiClient } from '../../../services/api-client'
import type { Comentario } from '../../../types/comentario'

export async function listComentarios(
  publicacaoId: string,
  page: number,
  limit: number,
): Promise<Comentario[]> {
  const comentarios = await apiClient<Comentario[] | null>(
    `/posts/${publicacaoId}/comments?page=${page}&limit=${limit}`,
  )

  return comentarios ?? []
}

export async function createComentario(publicacaoId: string, conteudo: string): Promise<Comentario> {
  return apiClient<Comentario>(`/posts/${publicacaoId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ conteudo }),
  })
}
