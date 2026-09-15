import { apiClient } from '../../../services/api-client'

export interface LoginResponse {
  token: string
}

export async function login(email: string, senha: string): Promise<LoginResponse> {
  return apiClient<LoginResponse>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  })
}
