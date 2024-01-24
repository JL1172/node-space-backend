import { IsJWT, IsNotEmpty } from 'class-validator';

export class LogoutBody {
  @IsNotEmpty({ message: 'Token Required' })
  @IsJWT({ message: 'Must Be Valid Token' })
  token: string;
}
export class PayloadBody {
  jwt: string;
  expiration_time: Date;
}
