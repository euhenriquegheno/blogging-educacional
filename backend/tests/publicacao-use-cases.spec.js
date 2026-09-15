const {
  CreatePublicacaoUseCase,
} = require('../build/uses-cases/create-publicacao')
const {
  DeletePublicacaoUseCase,
} = require('../build/uses-cases/delete-publicacao')
const {
  ResourceNotFoundError,
} = require('../build/uses-cases/errors/resource-not-found')
const {
  ForbiddenError,
} = require('../build/uses-cases/errors/forbidden-error')
const {
  UpdatePublicacaoUseCase,
} = require('../build/uses-cases/update-publicacao')
const { TipoUsuario } = require('../build/entities/models/tipo-usuario.enum')

class InMemoryPublicacaoRepository {
  publicacoes = []

  async findAll() {
    return this.publicacoes
  }

  async search() {
    return this.publicacoes
  }

  async findById(id) {
    return this.publicacoes.find((publicacao) => publicacao.id === id) ?? null
  }

  async create(publicacao) {
    this.publicacoes.push(publicacao)
    return publicacao
  }

  async update(publicacao) {
    const index = this.publicacoes.findIndex(
      (item) => item.id === publicacao.id,
    )
    this.publicacoes[index] = publicacao
    return publicacao
  }

  async delete(id) {
    const index = this.publicacoes.findIndex(
      (publicacao) => publicacao.id === id,
    )

    if (index === -1) {
      return false
    }

    this.publicacoes.splice(index, 1)
    return true
  }
}

const usuario = { id: 1 }
const usuarioLogadoAutor = { id: 1, tipo: TipoUsuario.PROFESSOR }
const usuarioLogadoOutroProfessor = { id: 2, tipo: TipoUsuario.PROFESSOR }
const usuarioLogadoAdministrador = { id: 3, tipo: TipoUsuario.ADMINISTRADOR }

function makePublicacao(id = 'post-1') {
  return {
    id,
    titulo: 'Título original',
    conteudo: 'Conteúdo original',
    usuario,
  }
}

describe('Publicacao use cases', () => {
  it('creates a post', async () => {
    const repository = new InMemoryPublicacaoRepository()
    const useCase = new CreatePublicacaoUseCase(repository)
    const publicacao = makePublicacao()

    const created = await useCase.handler(publicacao)

    expect(created).toEqual(publicacao)
    expect(repository.publicacoes).toContainEqual(publicacao)
  })

  it('updates an existing post and preserves its id', async () => {
    const repository = new InMemoryPublicacaoRepository()
    repository.publicacoes.push(makePublicacao())
    const useCase = new UpdatePublicacaoUseCase(repository)

    const updated = await useCase.handler(
      'post-1',
      {
        titulo: 'Novo título',
        conteudo: 'Novo conteúdo',
      },
      usuarioLogadoAutor,
    )

    expect(updated).toMatchObject({
      id: 'post-1',
      titulo: 'Novo título',
      conteudo: 'Novo conteúdo',
    })
  })

  it('does not change the original author when the update payload has no usuario field (as sent by the controller)', async () => {
    const repository = new InMemoryPublicacaoRepository()
    repository.publicacoes.push(makePublicacao())
    const useCase = new UpdatePublicacaoUseCase(repository)

    const updated = await useCase.handler(
      'post-1',
      {
        titulo: 'Tentativa de reatribuir autoria',
        conteudo: 'Conteúdo',
      },
      usuarioLogadoAutor,
    )

    expect(updated.usuario).toEqual(usuario)
  })

  it('does not update a post that does not exist', async () => {
    const useCase = new UpdatePublicacaoUseCase(
      new InMemoryPublicacaoRepository(),
    )

    await expect(
      useCase.handler('missing', makePublicacao(), usuarioLogadoAutor),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('allows a Professor to update their own post', async () => {
    const repository = new InMemoryPublicacaoRepository()
    repository.publicacoes.push(makePublicacao())
    const useCase = new UpdatePublicacaoUseCase(repository)

    const updated = await useCase.handler(
      'post-1',
      { titulo: 'Editado pelo autor', conteudo: 'Conteúdo', usuario },
      usuarioLogadoAutor,
    )

    expect(updated).toMatchObject({ titulo: 'Editado pelo autor' })
  })

  it('rejects with ForbiddenError when a Professor tries to update another professor post', async () => {
    const repository = new InMemoryPublicacaoRepository()
    repository.publicacoes.push(makePublicacao())
    const useCase = new UpdatePublicacaoUseCase(repository)

    await expect(
      useCase.handler(
        'post-1',
        { titulo: 'Tentativa alheia', conteudo: 'Conteúdo', usuario },
        usuarioLogadoOutroProfessor,
      ),
    ).rejects.toBeInstanceOf(ForbiddenError)
  })

  it('allows an Administrador to update any post', async () => {
    const repository = new InMemoryPublicacaoRepository()
    repository.publicacoes.push(makePublicacao())
    const useCase = new UpdatePublicacaoUseCase(repository)

    const updated = await useCase.handler(
      'post-1',
      { titulo: 'Editado pelo admin', conteudo: 'Conteúdo', usuario },
      usuarioLogadoAdministrador,
    )

    expect(updated).toMatchObject({ titulo: 'Editado pelo admin' })
  })

  it('deletes an existing post', async () => {
    const repository = new InMemoryPublicacaoRepository()
    repository.publicacoes.push(makePublicacao())
    const useCase = new DeletePublicacaoUseCase(repository)

    await useCase.handler('post-1', usuarioLogadoAutor)

    expect(repository.publicacoes).toHaveLength(0)
  })

  it('does not delete a post that does not exist', async () => {
    const useCase = new DeletePublicacaoUseCase(
      new InMemoryPublicacaoRepository(),
    )

    await expect(
      useCase.handler('missing', usuarioLogadoAutor),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('allows a Professor to delete their own post', async () => {
    const repository = new InMemoryPublicacaoRepository()
    repository.publicacoes.push(makePublicacao())
    const useCase = new DeletePublicacaoUseCase(repository)

    await useCase.handler('post-1', usuarioLogadoAutor)

    expect(repository.publicacoes).toHaveLength(0)
  })

  it('rejects with ForbiddenError when a Professor tries to delete another professor post', async () => {
    const repository = new InMemoryPublicacaoRepository()
    repository.publicacoes.push(makePublicacao())
    const useCase = new DeletePublicacaoUseCase(repository)

    await expect(
      useCase.handler('post-1', usuarioLogadoOutroProfessor),
    ).rejects.toBeInstanceOf(ForbiddenError)

    expect(repository.publicacoes).toHaveLength(1)
  })

  it('allows an Administrador to delete any post', async () => {
    const repository = new InMemoryPublicacaoRepository()
    repository.publicacoes.push(makePublicacao())
    const useCase = new DeletePublicacaoUseCase(repository)

    await useCase.handler('post-1', usuarioLogadoAdministrador)

    expect(repository.publicacoes).toHaveLength(0)
  })
})
