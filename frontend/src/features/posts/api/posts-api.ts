import { apiClient } from '../../../services/api-client'
import type { Publicacao } from '../../../types/publicacao'

export interface PostInput {
  titulo: string
  conteudo: string
}

export async function listPosts(page: number, limit: number): Promise<Publicacao[]> {
  return apiClient<Publicacao[]>(`/posts?page=${page}&limit=${limit}`)
}

export async function searchPosts(q: string): Promise<Publicacao[]> {
  return apiClient<Publicacao[]>(`/posts/search?q=${encodeURIComponent(q)}`)
}

export async function getPost(id: string): Promise<Publicacao> {
  return apiClient<Publicacao>(`/posts/${id}`)
}

export async function createPost({ titulo, conteudo }: PostInput): Promise<Publicacao> {
  return apiClient<Publicacao>('/posts', {
    method: 'POST',
    body: JSON.stringify({ titulo, conteudo }),
  })
}

export async function updatePost(id: string, { titulo, conteudo }: PostInput): Promise<Publicacao> {
  return apiClient<Publicacao>(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ titulo, conteudo }),
  })
}

export async function deletePost(id: string): Promise<void> {
  await apiClient<void>(`/posts/${id}`, {
    method: 'DELETE',
  })
}
