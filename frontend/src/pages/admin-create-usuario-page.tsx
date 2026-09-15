import { useState } from 'react'
import type { FormEvent } from 'react'
import { createUsuario } from '../features/auth/api/usuario-api'
import type { Usuario } from '../types/usuario'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const OPCOES_TIPO: Array<{ valor: Usuario['tipo']; rotulo: string }> = [
  { valor: 'ADMINISTRADOR', rotulo: 'Administrador' },
  { valor: 'PROFESSOR', rotulo: 'Professor' },
  { valor: 'ALUNO', rotulo: 'Aluno' },
]

/**
 * Página administrativa de criação de contas de usuário. Acessível apenas a
 * Administradores (guarda de rota registrada na Fase 14). Envia `tipo` como
 * string de domínio; a conversão para o valor numérico exigido pelo backend
 * acontece em `createUsuario`.
 */
export default function AdminCreateUsuarioPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [cpf, setCpf] = useState('')
  const [tipo, setTipo] = useState<Usuario['tipo']>('PROFESSOR')
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro(null)
    setSucesso(false)

    if (!EMAIL_REGEX.test(email)) {
      setErro('Informe um e-mail em formato válido')
      return
    }

    setCarregando(true)

    try {
      await createUsuario({ nome, email, senha, cpf, tipo })
      setSucesso(true)
      setNome('')
      setEmail('')
      setSenha('')
      setCpf('')
      setTipo('PROFESSOR')
    } catch {
      setErro('Não foi possível criar a conta. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-sm space-y-4 rounded-lg bg-white p-8 shadow"
      >
        <h1 className="text-xl font-semibold text-gray-900">Criar conta de usuário</h1>

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
          <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
            Senha
          </label>
          <input
            id="senha"
            name="senha"
            type="password"
            autoComplete="new-password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
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

        {sucesso && <p className="text-sm text-green-600">Conta criada com sucesso!</p>}

        <button
          type="submit"
          disabled={carregando}
          className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {carregando ? 'Criando...' : 'Criar conta'}
        </button>
      </form>
    </div>
  )
}
