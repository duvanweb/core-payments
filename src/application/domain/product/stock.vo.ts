import { ValueObject } from '@application/domain/shared/value-object';
import { Result, ok, err } from '@application/domain/shared/result';
import { InvalidStockError } from './product-errors';

export class Stock extends ValueObject<number> {
  get value(): number {
    return this.props;
  }

  static create(value: number): Result<Stock, InvalidStockError> {
    if (!Number.isInteger(value)) {
      return err(new InvalidStockError('Stock must be an integer'));
    }
    if (value < 0) {
      return err(new InvalidStockError('Stock must not be negative'));
    }
    return ok(new Stock(value));
  }
}
