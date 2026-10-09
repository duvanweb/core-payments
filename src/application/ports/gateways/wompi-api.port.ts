import { ResultAsync } from '@application/domain/shared/result';
import { WompiApiError } from '@application/domain/transaction/transaction-errors';

export const WOMPI_API = Symbol('WOMPI_API');

export interface WompiTransactionData {
  id: string;
  status: string;
  reference: string;
}

export interface WompiApiPort {
  getTransactionById(
    wompiTransactionId: string,
  ): ResultAsync<WompiTransactionData | null, WompiApiError>;
  getTransactionByReference(
    reference: string,
  ): ResultAsync<WompiTransactionData | null, WompiApiError>;
}
