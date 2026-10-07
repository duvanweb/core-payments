import { ValueObject } from '@application/domain/shared/value-object';
import { Result, ok, err } from '@application/domain/shared/result';
import { InvalidProductTitleError } from './product-errors';

const MAX_LENGTH = 200;

export class ProductTitle extends ValueObject<string> {
  get value(): string {
    return this.props;
  }

  static create(value: string): Result<ProductTitle, InvalidProductTitleError> {
    if (value === null || value === undefined || value.trim().length === 0) {
      return err(new InvalidProductTitleError('Product title must not be empty'));
    }
    if (value.length > MAX_LENGTH) {
      return err(
        new InvalidProductTitleError(
          `Product title must not exceed ${MAX_LENGTH} characters`,
        ),
      );
    }
    return ok(new ProductTitle(value));
  }
}
