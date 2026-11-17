export class InvalidAuthorError extends Error {
  constructor() {
    super('O autor deve ser um Professor ou Administrador')
  }
}
