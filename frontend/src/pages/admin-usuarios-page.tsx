import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { deleteUsuario, listUsuarios } from '../features/auth/api/usuario-api'
import type { Usuario } from '../types/usuario'

/**
 * Página administrativa de usuários: lista os usuários cadastrados e
 * permite ao Administrador criar, editar ou excluir contas.
 */
export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const navigate = useNavigate()

  useEffect(() => {
    let ativo = true

    async function carregarUsuarios() {
      setCarregando(true)
      setErro(null)
      try {
        const resultado = await listUsuarios(1, 100)
        if (ativo) {
          setUsuarios(resultado)
        }
      } catch {
        if (ativo) {
          setErro('Não foi possível carregar os usuários')
        }
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    carregarUsuarios()

    return () => {
      ativo = false
    }
  }, [])

  function handleEditar(id: number) {
    navigate(`/admin/usuarios/${id}/editar`)
  }

  async function handleExcluir(id: number) {
    const confirmado = window.confirm('Tem certeza que deseja excluir este usuário?')
    if (!confirmado) {
      return
    }

    try {
      await deleteUsuario(id)
      setUsuarios((atuais) => atuais.filter((usuario) => usuario.id !== id))
    } catch {
      setErro('Não foi possível excluir o usuário')
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Link
          to="/admin/usuarios/novo"
          className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
        >
          Novo usuário
        </Link>
      </div>

      {erro && (
        <p role="alert" className="mb-4 text-sm text-red-600">
          {erro}
        </p>
      )}

      {carregando ? (
        <p>Carregando usuários...</p>
      ) : usuarios.length === 0 ? (
        <p>Nenhum usuário encontrado.</p>
      ) : (
        <ul className="space-y-3">
          {usuarios.map((usuario) => (
            <li
              key={usuario.id}
              className="flex items-center justify-between rounded border border-gray-200 bg-white px-4 py-3 shadow-sm"
            >
              <div>
                <p className="font-medium text-gray-900">{usuario.nome}</p>
                <p className="text-sm text-gray-500">
                  {usuario.email} · {usuario.tipo}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEditar(usuario.id)}
                  className="rounded border border-blue-600 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleExcluir(usuario.id)}
                  className="rounded border border-red-600 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
