import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(username:string, email: string, passwordPlain: string) {
    const existing = await this.usersService.findOne(email);
    if (existing) {
      throw new ConflictException('Usuário já existe');
    }

    const user = await this.usersService.create(username, email, passwordPlain);
    return { id: user.id, email: user.email };
  }

  async login(email: string, passwordPlain: string) {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async profile(userId: number) {
  const user = await this.usersService.findById(userId);
  if (!user) {
    throw new UnauthorizedException();
  }
  return {
    id: user.id,
    username: user.name,
    email: user.email,
  };
}
}