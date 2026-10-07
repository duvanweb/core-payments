/**
 * Base class for immutable Value Objects.
 * Equality is structural: two VOs are equal if their props are deeply equal.
 */
export abstract class ValueObject<Props> {
  constructor(readonly props: Props) {}

  equals(other: ValueObject<Props>): boolean {
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
