const { Comentario } = require('../build/entities/comentario.entity')
const { Usuario } = require('../build/entities/usuario.entity')
const { Publicacao } = require('../build/entities/publicacao.entity')
const { TipoUsuario } = require('../build/entities/models/tipo-usuario.enum')

describe('Comentario entity', () => {
  it('preserva conteudo, usuario e publicacao ao instanciar', () => {
    const usuario = new Usuario()
    usuario.id = 1
    usuario.email = 'professor@example.com'
    usuario.senha = 'hash'
    usuario.nome = 'Professor Teste'
    usuario.cpf = '12345678900'
    usuario.tipo = TipoUsuario.PROFESSOR

    const publicacao = new Publicacao()
    publicacao.id = 'publicacao-uuid'
    publicacao.titulo = 'Titulo'
    publicacao.conteudo = 'Conteudo da publicacao'
    publicacao.usuario = usuario

    const comentario = new Comentario()
    comentario.conteudo = 'Excelente material!'
    comentario.usuario = usuario
    comentario.publicacao = publicacao

    expect(comentario.conteudo).toBe('Excelente material!')
    expect(comentario.usuario).toBe(usuario)
    expect(comentario.publicacao).toBe(publicacao)
  })
})
