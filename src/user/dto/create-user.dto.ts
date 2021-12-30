import { IsEmail, Length } from 'class-validator';

export class CreateUserDto {
  @Length(2)
  fullName: string;

  @Length(6, 32, { message: 'Пароль должен состоять минимум из 6 символов!' })
  password?: string;

  @IsEmail()
  email: string;
}
