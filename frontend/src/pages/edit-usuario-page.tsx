import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getUsuario, updateUsuario } from '../features/auth/api/usuario-api'
import type { Usuario } from '../types/usuario'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const OPCOES_TIPO: Array<{ valor: Usuario['tipo']; rotulo: string }> = [
  { valor: 'ADMINISTRADOR', rotulo: 'Administrador' },
  { valor: 'PROFESSOR', rotulo: 'Professor' },
  { valor: 'ALUNO', rotulo: 'Aluno' },
]

/**
 * Página de edição de usuário: carrega o usuário existente via
 * `getUsuario(id)`, pré-preenche o formulário e chama `updateUsuario` ao
 * submeter. Permite editar apenas nome, e-mail, CPF e tipo — a senha não é
 * alterada por aqui.
 */
export default function EditUsuarioPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [tipo, setTipo] = useState<Usuario['tipo']>('PROFESSOR')
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      return
    }

    let cancelado = false

    getUsuario(Number(id))
      .then((usuario) => {
        if (cancelado) {
          return
        }
        setNome(usuario.nome)
        setEmail(usuario.email)
        setCpf(usuario.cpf)
        setTipo(usuario.tipo)
      })
      .catch(() => {
        if (!cancelado) {
          setErro('Não foi possível carregar o usuário')
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCarregando(false)
        }
      })

    return () => {
      cancelado = true
    }
  }, [id])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!id) {
      return
    }

    if (!EMAIL_REGEX.test(email)) {
      setErro('Informe um e-mail em formato válido')
      return
    }

    setErro(null)
    setSalvando(true)

    try {
      await updateUsuario(Number(id), { nome, email, cpf, tipo })
      navigate('/admin/usuarios')
    } catch {
      setErro('Não foi possível salvar as alterações')
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return <p>Carregando...</p>
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-sm space-y-4 rounded-lg bg-white p-8 shadow"
      >
        <h1 className="text-xl font-semibold text-gray-900">Editar usuário</h1>

        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
            Nome
          </label>
          <input
            id="nome"
            name="nome"
            type="text"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
            CPF
          </label>
          <input
            id="cpf"
            name="cpf"
            type="text"
            value={cpf}
            onChange={(event) => setCpf(event.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
            Tipo
          </label>
          <select
            id="tipo"
            name="tipo"
            value={tipo}
            onChange={(event) => setTipo(event.target.value as Usuario['tipo'])}
            className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none"
          >
            {OPCOES_TIPO.map((opcao) => (
              <option key={opcao.valor} value={opcao.valor}>
                {opcao.rotulo}
              </option>
            ))}
          </select>
        </div>

        {erro && (
          <p role="alert" className="text-sm text-red-600">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={salvando}
          className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  )
}
