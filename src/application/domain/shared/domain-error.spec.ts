import { DomainError } from './domain-error';

class TestError extends DomainError {
  constructor(code: string, message: string) {
    super(code, message);
  }
}

describe('DomainError', () => {
  it('stores code correctly', () => {
    const error = new TestError('TEST_ERROR', 'something went wrong');
    expect(error.code).toBe('TEST_ERROR');
  });

  it('stores message correctly', () => {
    const error = new TestError('TEST_ERROR', 'something went wrong');
    expect(error.message).toBe('something went wrong');
  });
});
