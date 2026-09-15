const { appDataSource } = require('../build/lib/typeorm/typeorm')
const { Comentario } = require('../build/entities/comentario.entity')

describe('TypeORM Configuration - Comentario', () => {
  it('should include the Comentario entity in appDataSource.options.entities', () => {
    expect(appDataSource.options.entities).toContain(Comentario)
  })
})
