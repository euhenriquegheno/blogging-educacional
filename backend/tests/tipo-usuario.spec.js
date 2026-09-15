const { TipoUsuario } = require('../build/entities/models/tipo-usuario.enum')

describe('TipoUsuario enum', () => {
  it('defines ADMINISTRADOR, PROFESSOR and ALUNO with distinct numeric values between 1 and 3', () => {
    expect(TipoUsuario.ADMINISTRADOR).toBe(1)
    expect(TipoUsuario.PROFESSOR).toBe(2)
    expect(TipoUsuario.ALUNO).toBe(3)

    const valores = [
      TipoUsuario.ADMINISTRADOR,
      TipoUsuario.PROFESSOR,
      TipoUsuario.ALUNO,
    ]

    valores.forEach((valor) => {
      expect(valor).toBeGreaterThanOrEqual(1)
      expect(valor).toBeLessThanOrEqual(3)
    })

    expect(new Set(valores).size).toBe(3)
  })
})
