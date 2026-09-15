import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import NotFoundPage from './not-found-page'

describe('NotFoundPage', () => {
  it('exibe a mensagem de página não encontrada e um link para a página inicial', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/página não encontrada/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /página inicial/i })).toHaveAttribute('href', '/')
  })
})
