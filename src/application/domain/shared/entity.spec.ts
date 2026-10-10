import { Entity } from './entity';

class TestEntity extends Entity<string> {}

describe('Entity', () => {
  it('two entities with the same id are equal', () => {
    const a = new TestEntity('id-1');
    const b = new TestEntity('id-1');
    expect(a.equals(b)).toBe(true);
  });

  it('two entities with different ids are not equal', () => {
    const a = new TestEntity('id-1');
    const b = new TestEntity('id-2');
    expect(a.equals(b)).toBe(false);
  });

  it('equals returns a boolean', () => {
    const a = new TestEntity('id-1');
    const b = new TestEntity('id-1');
    expect(typeof a.equals(b)).toBe('boolean');
  });
});
