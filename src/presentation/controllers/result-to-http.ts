import { HttpException, HttpStatus } from '@nestjs/common';
import { DomainError } from '@application/domain/shared/domain-error';

/**
 * Maps a DomainError to an HttpException.
 * Extend the switch with specific error codes as the domain grows.
 */
export function resultToHttp(error: DomainError): HttpException {
  return new HttpException(
    {
      code: error.code,
      message: error.message,
    },
    mapErrorToHttpStatus(error),
  );
}

function mapErrorToHttpStatus(error: DomainError): HttpStatus {
  switch (error.code) {
    case 'PRODUCT_NOT_FOUND':
      return HttpStatus.NOT_FOUND;
    default:
      return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
