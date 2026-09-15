interface PaginationProps {
  page: number
  hasNextPage?: boolean
  onPreviousPage: () => void
  onNextPage: () => void
}

/**
 * Controles de paginação simples (anterior/próxima), usados na listagem de
 * posts. `hasNextPage` deve ser calculado pelo consumidor (a API não retorna
 * o total de itens, então normalmente é inferido pelo tamanho da página
 * retornada em relação ao limite solicitado).
 */
export function Pagination({ page, hasNextPage = true, onPreviousPage, onNextPage }: PaginationProps) {
  return (
    <nav aria-label="Paginação" className="mt-6 flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={onPreviousPage}
        disabled={page <= 1}
        className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Página anterior
      </button>
      <span className="text-sm text-gray-600">Página {page}</span>
      <button
        type="button"
        onClick={onNextPage}
        disabled={!hasNextPage}
        className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Próxima página
      </button>
    </nav>
  )
}
