import { IsJWT, IsNotEmpty } from 'class-validator';

export class HeadersPayloadType {
  @IsNotEmpty({ message: 'Improper Authorization: Do Not Have Access' })
  @IsJWT({ message: 'Improper Format For Token' })
  token: string;
}
