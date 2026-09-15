import { afterEach, describe, expect, it, vi } from 'vitest'
import { createUsuario, deleteUsuario, getUsuario, listUsuarios, updateUsuario } from './usuario-api'

describe('createUsuario', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('faz POST /user com o tipo convertido para o valor numérico esperado pelo backend', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ id: 1, nome: 'Maria Professora', email: 'maria@escola.com', cpf: '12345678900', tipo: 2 }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await createUsuario({
      nome: 'Maria Professora',
      email: 'maria@escola.com',
      senha: 'senha123',
      cpf: '12345678900',
      tipo: 'PROFESSOR',
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('/user')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toEqual({
      nome: 'Maria Professora',
      email: 'maria@escola.com',
      senha: 'senha123',
      cpf: '12345678900',
      tipo: 2,
    })
    expect(result).toEqual({
      id: 1,
      nome: 'Maria Professora',
      email: 'maria@escola.com',
      cpf: '12345678900',
      tipo: 2,
    })
  })

  it.each([
    ['ADMINISTRADOR', 1],
    ['PROFESSOR', 2],
    ['ALUNO', 3],
  ] as const)('converte tipo %s para o número %i', async (tipo, numero) => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({}), { status: 201, headers: { 'Content-Type': 'application/json' } }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await createUsuario({
      nome: 'Fulano',
      email: 'fulano@escola.com',
      senha: 'senha123',
      cpf: '12345678900',
      tipo,
    })

    const [, init] = fetchMock.mock.calls[0]
    expect(JSON.parse(init?.body as string).tipo).toBe(numero)
  })

  it('rejeita com um erro contendo a mensagem da API quando a resposta não é 2xx', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'E-mail já cadastrado' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      createUsuario({
        nome: 'Fulano',
        email: 'fulano@escola.com',
        senha: 'senha123',
        cpf: '12345678900',
        tipo: 'ALUNO',
      }),
    ).rejects.toThrow('E-mail já cadastrado')
  })
})

describe('listUsuarios', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('faz GET /user com os parâmetros de paginação e converte o tipo numérico para o valor de domínio', async () => {
    const usuariosApiMock = [
      { id: 1, nome: 'Admin', email: 'admin@escola.com', cpf: '11111111111', tipo: 1 },
      { id: 2, nome: 'Maria Professora', email: 'maria@escola.com', cpf: '22222222222', tipo: 2 },
    ]
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(usuariosApiMock), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await listUsuarios(1, 100)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('/user?page=1&limit=100')
    expect(result).toEqual([
      { id: 1, nome: 'Admin', email: 'admin@escola.com', cpf: '11111111111', tipo: 'ADMINISTRADOR' },
      { id: 2, nome: 'Maria Professora', email: 'maria@escola.com', cpf: '22222222222', tipo: 'PROFESSOR' },
    ])
  })
})

describe('getUsuario', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('faz GET /user/:id e converte o tipo numérico para o valor de domínio', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ id: 2, nome: 'Maria Professora', email: 'maria@escola.com', cpf: '22222222222', tipo: 2 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await getUsuario(2)

    const [url] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('/user/2')
    expect(result).toEqual({
      id: 2,
      nome: 'Maria Professora',
      email: 'maria@escola.com',
      cpf: '22222222222',
      tipo: 'PROFESSOR',
    })
  })
})

describe('updateUsuario', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('faz PUT /user/:id sem senha, com o tipo convertido para o valor numérico esperado pelo backend', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await updateUsuario(2, {
      nome: 'Maria Professora',
      email: 'maria@escola.com',
      cpf: '22222222222',
      tipo: 'PROFESSOR',
    })

    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('/user/2')
    expect(init?.method).toBe('PUT')
    expect(JSON.parse(init?.body as string)).toEqual({
      nome: 'Maria Professora',
      email: 'maria@escola.com',
      cpf: '22222222222',
      tipo: 2,
    })
  })
})

describe('deleteUsuario', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('faz DELETE /user/:id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await deleteUsuario(2)

    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('/user/2')
    expect(init?.method).toBe('DELETE')
  })
})
