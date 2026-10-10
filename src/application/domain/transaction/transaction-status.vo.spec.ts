import { TransactionStatus } from './transaction-status.vo';

describe('TransactionStatus', () => {
  it('creates a PENDING status', () => {
    const result = TransactionStatus.create('PENDING');
    expect(result.isOk()).toBe(true);
    result.match(
      (vo) => expect(vo.value).toBe('PENDING'),
      () => fail('Expected Ok'),
    );
  });

  it('creates an APPROVED status', () => {
    const result = TransactionStatus.create('APPROVED');
    expect(result.isOk()).toBe(true);
  });

  it('creates a DECLINED status', () => {
    const result = TransactionStatus.create('DECLINED');
    expect(result.isOk()).toBe(true);
  });

  it('creates an ERROR status', () => {
    const result = TransactionStatus.create('ERROR');
    expect(result.isOk()).toBe(true);
  });

  it('rejects an invalid status', () => {
    const result = TransactionStatus.create('INVALID');
    expect(result.isErr()).toBe(true);
  });

  it('pending() returns a PENDING status', () => {
    const status = TransactionStatus.pending();
    expect(status.value).toBe('PENDING');
  });

  it('isTerminal returns true for APPROVED', () => {
    const status = TransactionStatus.create('APPROVED').match(
      (s) => s,
      () => fail('Expected Ok'),
    );
    expect(status.isTerminal()).toBe(true);
  });

  it('isTerminal returns true for DECLINED', () => {
    const status = TransactionStatus.create('DECLINED').match(
      (s) => s,
      () => fail('Expected Ok'),
    );
    expect(status.isTerminal()).toBe(true);
  });

  it('isTerminal returns true for ERROR', () => {
    const status = TransactionStatus.create('ERROR').match(
      (s) => s,
      () => fail('Expected Ok'),
    );
    expect(status.isTerminal()).toBe(true);
  });

  it('isTerminal returns false for PENDING', () => {
    const status = TransactionStatus.pending();
    expect(status.isTerminal()).toBe(false);
  });
});

function fail(message: string): never {
  throw new Error(message);
}
