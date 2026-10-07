import { ResultAsync } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';

/**
 * Input port — every use case implements this interface.
 * `I` = input, `O` = output, `E` = error (defaults to DomainError).
 */
export interface UseCase<I, O, E extends DomainError = DomainError> {
  execute(input: I): ResultAsync<O, E>;
}
