import { IsEmail, IsIn, IsPhoneNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsPhoneNumber('IN')
  phone: string;

  @IsIn(['active', 'inactive', 'banned'])
  status: 'active' | 'inactive' | 'banned';
}
