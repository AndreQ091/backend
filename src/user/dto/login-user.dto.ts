import { IsEmail, Length } from 'class-validator';

export class LoginUserDto {
  id?: number;
  @Length(6, 32, { message: 'Пароль должен состоять минимум из 6 символов!' })
  password?: string;

  @IsEmail()
  email: string;
}
