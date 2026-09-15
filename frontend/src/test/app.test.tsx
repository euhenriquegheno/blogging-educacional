import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { listPosts } from '../features/posts/api/posts-api'
import App from '../app/config/app'

vi.mock('../features/posts/api/posts-api', () => ({
  listPosts: vi.fn(),
  searchPosts: vi.fn(),
}))

describe('App', () => {
  it('renderiza sem erros, exibindo o layout principal na rota inicial', async () => {
    vi.mocked(listPosts).mockResolvedValue([])

    render(<App />)

    expect(await screen.findByText(/API Blogging/i)).toBeInTheDocument()
  })
})
