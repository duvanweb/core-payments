/**
 * Base class for domain entities identified by `Id`.
 * Entities have identity; equality is based on `id`.
 */
export abstract class Entity<Id> {
  constructor(readonly id: Id) {}

  equals(other: Entity<Id>): boolean {
    return this.id === other.id;
  }
}
