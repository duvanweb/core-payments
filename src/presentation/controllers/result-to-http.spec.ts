import { HttpException, HttpStatus } from '@nestjs/common';
import { DomainError } from '@application/domain/shared/domain-error';
import { resultToHttp } from './result-to-http';

function makeError(code: string, message = 'test'): DomainError {
  return new (class extends DomainError {})(code, message);
}

describe('resultToHttp', () => {
  it('maps PRODUCT_NOT_FOUND to 404', () => {
    const exception = resultToHttp(makeError('PRODUCT_NOT_FOUND'));
    expect(exception).toBeInstanceOf(HttpException);
    expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
  });

  it('maps TRANSACTION_NOT_FOUND to 404', () => {
    const exception = resultToHttp(makeError('TRANSACTION_NOT_FOUND'));
    expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
  });

  it('maps INSUFFICIENT_STOCK to 409', () => {
    const exception = resultToHttp(makeError('INSUFFICIENT_STOCK'));
    expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
  });

  it('maps PRICE_MISMATCH to 409', () => {
    const exception = resultToHttp(makeError('PRICE_MISMATCH'));
    expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
  });

  it('maps INVALID_CUSTOMER_EMAIL to 400', () => {
    const exception = resultToHttp(makeError('INVALID_CUSTOMER_EMAIL'));
    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
  });

  it('maps INVALID_CUSTOMER_FULL_NAME to 400', () => {
    const exception = resultToHttp(makeError('INVALID_CUSTOMER_FULL_NAME'));
    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
  });

  it('maps INVALID_CUSTOMER_PHONE_NUMBER to 400', () => {
    const exception = resultToHttp(makeError('INVALID_CUSTOMER_PHONE_NUMBER'));
    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
  });

  it('maps INVALID_CUSTOMER_PHONE_PREFIX to 400', () => {
    const exception = resultToHttp(makeError('INVALID_CUSTOMER_PHONE_PREFIX'));
    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
  });

  it('maps INVALID_CUSTOMER_LEGAL_ID to 400', () => {
    const exception = resultToHttp(makeError('INVALID_CUSTOMER_LEGAL_ID'));
    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
  });

  it('maps INVALID_CUSTOMER_LEGAL_ID_TYPE to 400', () => {
    const exception = resultToHttp(makeError('INVALID_CUSTOMER_LEGAL_ID_TYPE'));
    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
  });

  it('maps INVALID_SHIPPING_ADDRESS to 400', () => {
    const exception = resultToHttp(makeError('INVALID_SHIPPING_ADDRESS'));
    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
  });

  it('maps INVALID_TRANSACTION_STATUS to 400', () => {
    const exception = resultToHttp(makeError('INVALID_TRANSACTION_STATUS'));
    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
  });

  it('maps INVALID_PRODUCT_SNAPSHOT to 400', () => {
    const exception = resultToHttp(makeError('INVALID_PRODUCT_SNAPSHOT'));
    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
  });

  it('maps INVALID_CUSTOMER_SNAPSHOT to 400', () => {
    const exception = resultToHttp(makeError('INVALID_CUSTOMER_SNAPSHOT'));
    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
  });

  it('maps WOMPI_API_ERROR to 502', () => {
    const exception = resultToHttp(makeError('WOMPI_API_ERROR'));
    expect(exception.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
  });

  it('maps DELIVERY_NOT_FOUND to 404', () => {
    const exception = resultToHttp(makeError('DELIVERY_NOT_FOUND'));
    expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
  });

  it('maps DELIVERY_ALREADY_EXISTS to 409', () => {
    const exception = resultToHttp(makeError('DELIVERY_ALREADY_EXISTS'));
    expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
  });

  it('maps INVALID_DELIVERY_STATUS to 400', () => {
    const exception = resultToHttp(makeError('INVALID_DELIVERY_STATUS'));
    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
  });

  it('maps unknown error codes to 500', () => {
    const exception = resultToHttp(makeError('UNKNOWN_ERROR'));
    expect(exception.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('includes code and message in the response body', () => {
    const exception = resultToHttp(makeError('PRODUCT_NOT_FOUND', 'Product not found'));
    const response = exception.getResponse();
    expect(response).toEqual({
      code: 'PRODUCT_NOT_FOUND',
      message: 'Product not found',
    });
  });
});
