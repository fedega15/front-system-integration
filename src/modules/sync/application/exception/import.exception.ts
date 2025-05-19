import { HttpException, HttpStatus } from '@nestjs/common';

export class ImportException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    public readonly details?: any
  ) {
    super(
      {
        message,
        error: 'Import Error',
        details
      },
      status
    );
  }
}

export class InvalidCredentialsException extends ImportException {
  constructor(message: string = 'Credenciales de WooCommerce inválidas') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ProductProcessingException extends ImportException {
  constructor(productId: string, reason: string) {
    super(
      `Error procesando producto ${productId}: ${reason}`,
      HttpStatus.BAD_REQUEST,
      { productId, reason }
    );
  }
}

export class DuplicateProductException extends ImportException {
  constructor(productId: string, productName: string) {
    super(
      `Producto duplicado: ${productName}`,
      HttpStatus.CONFLICT,
      { productId, productName }
    );
  }
}

export class InvalidProductDataException extends ImportException {
  constructor(productId: string, reason: string) {
    super(
      `Datos de producto inválidos para ${productId}: ${reason}`,
      HttpStatus.BAD_REQUEST,
      { productId, reason }
    );
  }
}

export class DatabaseOperationException extends ImportException {
  constructor(operation: string, details: any) {
    super(
      `Error en operación de base de datos: ${operation}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      { operation, ...details }
    );
  }
} 