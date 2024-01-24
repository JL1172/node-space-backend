import {
  IsAlpha,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Matches,
  MinLength,
  ValidationOptions,
} from 'class-validator';

enum ROLE {
  USER = 'USER',
}
export class RegisterBody {
  @IsString({ message: 'First Name Must Be In Proper Format.' })
  @MinLength(2, { message: 'First Name Must Be Longer Than 2 Characters.' })
  @IsNotEmpty({ message: 'First Name Required.' })
  @IsAlpha(undefined, { message: 'First Name Must Only Be Letters' })
  first_name: string;
  @IsString({ message: 'Last Name Must Be In Proper Format.' })
  @MinLength(2, { message: 'Last Name Must Be Longer Than 2 Characters.' })
  @IsNotEmpty({ message: 'Last Name Required.' })
  @IsAlpha(undefined, { message: 'Last Name Must Only Be Letters' })
  last_name: string;
  @IsEmail({}, { message: 'Must Be A Valid Email.' })
  @IsNotEmpty({ message: 'Email Required.' })
  email: string;
  @IsString({ message: 'Username Must Be In Proper Format.' })
  @MinLength(6, { message: 'Username Must Be Longer Than 6 Characters.' })
  @IsNotEmpty({ message: 'Username Required.' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d).+/, {
    message: 'Username Must Contain Number and Letters.',
  })
  username: string;
  @IsString({ message: 'Password Must Be In Proper Format.' })
  @MinLength(8, { message: 'Password Must Be Longer Than 8 Characters.' })
  @IsStrongPassword({}, {
    message:
      'Password Requirements: Uppercase Letter, Lowercase Letter, Special Character, Number.',
  } as ValidationOptions)
  password: string;
  @IsEnum(ROLE, { message: 'Can Only Be User.' })
  role: ROLE;
}

export class RegisterPartition {
  @IsEmail({}, { message: 'Must Be A Valid Email.' })
  @IsNotEmpty({ message: 'Email Required.' })
  email: string;
  @IsString({ message: 'Username Must Be In Proper Format.' })
  @MinLength(6, { message: 'Username Must Be Longer Than 6 Characters.' })
  @IsNotEmpty({ message: 'Username Required.' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d).+/, {
    message: 'Username Must Contain Number and Letters.',
  })
  username: string;
}
