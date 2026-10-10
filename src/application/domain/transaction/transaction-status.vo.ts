import { ValueObject } from '@application/domain/shared/value-object';
import { Result, ok, err } from '@application/domain/shared/result';
import { InvalidTransactionStatusError } from './transaction-errors';

const ALLOWED_STATUSES = ['PENDING', 'APPROVED', 'DECLINED', 'ERROR'] as const;
export type TransactionStatusValue = (typeof ALLOWED_STATUSES)[number];

const TERMINAL_STATUSES: TransactionStatusValue[] = ['APPROVED', 'DECLINED', 'ERROR'];

export class TransactionStatus extends ValueObject<TransactionStatusValue> {
  get value(): TransactionStatusValue {
    return this.props;
  }

  static create(value: string): Result<TransactionStatus, InvalidTransactionStatusError> {
    if (!ALLOWED_STATUSES.includes(value as TransactionStatusValue)) {
      return err(
        new InvalidTransactionStatusError(
          `Transaction status must be one of: ${ALLOWED_STATUSES.join(', ')}`,
        ),
      );
    }
    return ok(new TransactionStatus(value as TransactionStatusValue));
  }

  static pending(): TransactionStatus {
    return new TransactionStatus('PENDING');
  }

  isTerminal(): boolean {
    return TERMINAL_STATUSES.includes(this.props);
  }
}
