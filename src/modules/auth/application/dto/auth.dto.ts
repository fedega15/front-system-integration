import { IsString, IsNotEmpty } from 'class-validator';

export class CompanyDto {
  @IsString()
  @IsNotEmpty()
  LegalName: string;

  @IsString()
  @IsNotEmpty()
  Orgnum: string;

  @IsString()
  @IsNotEmpty()
  fsSubscriptionKey: string;

  @IsString()
  @IsNotEmpty()
  fsApiKey: string;

  @IsString()
  @IsNotEmpty()
  wooConsumerKey: string;

  @IsString()
  @IsNotEmpty()
  wooConsumerSecret: string;

  @IsString()
  @IsNotEmpty()
  wooCommerceUrl: string;
}

export class AuthDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  LegalName: string;

  @IsString()
  @IsNotEmpty()
  Orgnum: string;

  @IsString()
  @IsNotEmpty()
  FsSubscriptionKey: string;

  @IsString()
  @IsNotEmpty()
  FsApiKey: string;

  @IsString()
  @IsNotEmpty()
  WooCommerceConsumerKey: string;

  @IsString()
  @IsNotEmpty()
  WooCommerceConsumerSecret: string;

  @IsString()
  @IsNotEmpty()
  WooCommerceUrl: string;
}
