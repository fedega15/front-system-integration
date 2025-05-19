import { IsString } from 'class-validator';

export class CreateWebhookDto {
  @IsString()
  event: string;

  @IsString()
  url: string;
}
