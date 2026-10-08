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
    case 'TRANSACTION_NOT_FOUND':
      return HttpStatus.NOT_FOUND;
    case 'INSUFFICIENT_STOCK':
      return HttpStatus.CONFLICT;
    case 'PRICE_MISMATCH':
      return HttpStatus.CONFLICT;
    case 'INVALID_CUSTOMER_EMAIL':
    case 'INVALID_CUSTOMER_FULL_NAME':
    case 'INVALID_CUSTOMER_PHONE_NUMBER':
    case 'INVALID_CUSTOMER_PHONE_PREFIX':
    case 'INVALID_CUSTOMER_LEGAL_ID':
    case 'INVALID_CUSTOMER_LEGAL_ID_TYPE':
    case 'INVALID_SHIPPING_ADDRESS':
    case 'INVALID_TRANSACTION_STATUS':
    case 'INVALID_PRODUCT_SNAPSHOT':
    case 'INVALID_CUSTOMER_SNAPSHOT':
      return HttpStatus.BAD_REQUEST;
    case 'WOMPI_API_ERROR':
      return HttpStatus.BAD_GATEWAY;
    default:
      return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
