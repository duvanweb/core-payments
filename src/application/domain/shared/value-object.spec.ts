import { ValueObject } from './value-object';

class TestVO extends ValueObject<{ name: string; age: number }> {}

describe('ValueObject', () => {
  it('two VOs with the same props are equal', () => {
    const a = new TestVO({ name: 'John', age: 30 });
    const b = new TestVO({ name: 'John', age: 30 });
    expect(a.equals(b)).toBe(true);
  });

  it('two VOs with different props are not equal', () => {
    const a = new TestVO({ name: 'John', age: 30 });
    const b = new TestVO({ name: 'Jane', age: 30 });
    expect(a.equals(b)).toBe(false);
  });

  it('handles deeply nested equal props', () => {
    class NestedVO extends ValueObject<{ nested: { value: string } }> {}
    const a = new NestedVO({ nested: { value: 'deep' } });
    const b = new NestedVO({ nested: { value: 'deep' } });
    expect(a.equals(b)).toBe(true);
  });

  it('handles deeply nested different props', () => {
    class NestedVO extends ValueObject<{ nested: { value: string } }> {}
    const a = new NestedVO({ nested: { value: 'deep' } });
    const b = new NestedVO({ nested: { value: 'shallow' } });
    expect(a.equals(b)).toBe(false);
  });
});
