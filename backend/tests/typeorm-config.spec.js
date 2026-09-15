const { appDataSource } = require('../build/lib/typeorm/typeorm')

describe('TypeORM Configuration', () => {
  it('should have MySQL as the database type', () => {
    expect(appDataSource.options.type).toBe('mysql')
  })

  it('should have all required database configuration properties', () => {
    expect(appDataSource.options).toHaveProperty('host')
    expect(appDataSource.options).toHaveProperty('port')
    expect(appDataSource.options).toHaveProperty('username')
    expect(appDataSource.options).toHaveProperty('password')
    expect(appDataSource.options).toHaveProperty('database')
    expect(appDataSource.options).toHaveProperty('entities')
    expect(appDataSource.options).toHaveProperty('synchronize')
    expect(appDataSource.options).toHaveProperty('logging')
  })
})
