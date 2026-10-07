/**
 * Base class for all domain errors.
 * Subclasses define a unique `code` and a human-readable `message`.
 */
export abstract class DomainError {
  constructor(
    readonly code: string,
    readonly message: string,
  ) {}
}
