import { IsNotEmpty, IsString } from 'class-validator';

export class LoginType {
  @IsNotEmpty({ message: 'Username Required.' })
  @IsString({ message: 'Username Must Be Correct Format.' })
  username: string;
  @IsNotEmpty({ message: 'Password Required.' })
  @IsString({ message: 'Password Must Be Correct Format.' })
  password: string;
}
