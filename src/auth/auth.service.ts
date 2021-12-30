import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  generateJwtToken = (data: { id: number; email: string }) => {
    const payload = { sub: data.id, email: data.email };
    return { access_token: this.jwtService.sign(payload) };
  };

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByCond({ email, password });
    if (user && user.password === password) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const { password, ...result } = user;
    return {
      ...result,
      token: this.generateJwtToken(result),
    };
  }

  async register(dto: CreateUserDto) {
    try {
      const { password, ...user } = await this.userService.create({
        fullName: dto.fullName,
        email: dto.email,
        password: dto.password,
      });
      return {
        ...user,
        token: this.generateJwtToken(user),
      };
    } catch (e) {
      throw new ForbiddenException('Ошибка при регистрации');
    }
  }
}
