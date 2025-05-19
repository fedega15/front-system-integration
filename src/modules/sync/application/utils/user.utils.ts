import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CurrentUser } from '../interface/current-user.interface';

const logger = new Logger('UserUtils');

export const validateCurrentUser = (currentUser: CurrentUser): void => {
  if (!currentUser?.userId) {
    logger.error('No user ID found');
    throw new HttpException(
      'Usuario no encontrado',
      HttpStatus.UNAUTHORIZED,
    );
  }
}; 