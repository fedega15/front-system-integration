import { HttpException, HttpStatus, Logger } from '@nestjs/common';

const logger = new Logger('ErrorUtils');

export const handleControllerError = (error: any, context: string): never => {
  logger.error(`Error en ${context}:`, error);
  
  if (error instanceof HttpException) {
    throw error;
  }
  
  throw new HttpException(
    'Error interno del servidor',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}; 