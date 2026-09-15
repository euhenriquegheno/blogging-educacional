import { useState } from 'react'
import type { FormEvent } from 'react'

interface SearchBarProps {
  onSearch: (termo: string) => void
}

/**
 * Campo de busca controlado. Ao submeter, notifica o consumidor com o termo
 * já sem espaços nas pontas (`onSearch('')` sinaliza limpar a busca).
 */
export function SearchBar({ onSearch }: SearchBarProps) {
  const [termo, setTermo] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSearch(termo.trim())
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="flex gap-2">
      <label htmlFor="busca-posts" className="sr-only">
        Buscar posts
      </label>
      <input
        id="busca-posts"
        name="busca"
        type="search"
        placeholder="Buscar posts..."
        value={termo}
        onChange={(event) => setTermo(event.target.value)}
        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
      >
        Buscar
      </button>
    </form>
  )
}
