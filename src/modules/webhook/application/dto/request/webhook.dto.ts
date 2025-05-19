import {
  IsString,
  IsOptional,
  IsArray,
  IsUrl,
  IsIn,
  IsDateString,
} from 'class-validator';

export class WCCreateWebhookDto {
  @IsOptional()
  @IsString()
  name?: string; // Nombre descriptivo del webhook

  @IsOptional()
  @IsString()
  @IsIn(['active', 'paused', 'disabled']) // Valores permitidos para el estado
  status?: string; // Estado del webhook (por defecto "active")

  @IsString()
  topic: string; // Tema del webhook (obligatorio)

  @IsUrl()
  delivery_url: string; // URL de entrega del webhook (obligatorio)

  @IsOptional()
  @IsString()
  secret?: string; // Clave secreta para firmar el webhook

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hooks?: string[]; // Nombres de acciones asociadas al webhook (solo lectura)

  @IsOptional()
  @IsDateString()
  date_created?: string; // Fecha de creación (solo lectura)

  @IsOptional()
  @IsDateString()
  date_created_gmt?: string; // Fecha de creación en GMT (solo lectura)

  @IsOptional()
  @IsDateString()
  date_modified?: string; // Fecha de última modificación (solo lectura)

  @IsOptional()
  @IsDateString()
  date_modified_gmt?: string; // Fecha de última modificación en GMT (solo lectura)
}
