import { compare } from 'bcrypt'
import { IUsuario } from '../entities/models/usuario.interface'
import { IUsuarioRepository } from '../repositories/usuario.repository.interface'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'

export class AuthenticateUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async handler(email: string, senha: string): Promise<IUsuario> {
    const usuario = await this.usuarioRepository.findByEmail(email)

    if (!usuario) {
      throw new InvalidCredentialsError()
    }

    const senhaConfere = await compare(senha, usuario.senha)

    if (!senhaConfere) {
      throw new InvalidCredentialsError()
    }

    return usuario
  }
}
