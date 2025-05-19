import { IsString, IsUrl } from 'class-validator';

export class WooCommerceUrlDto {
  @IsString()
  @IsUrl()
  url: string;
} 