import { DeliveryStatus } from './delivery-status.vo';

describe('DeliveryStatus', () => {
  it('creates a PENDING status', () => {
    const result = DeliveryStatus.create('PENDING');
    expect(result.isOk()).toBe(true);
    result.match(
      (vo) => expect(vo.value).toBe('PENDING'),
      () => fail('Expected Ok'),
    );
  });

  it('creates an IN_TRANSIT status', () => {
    const result = DeliveryStatus.create('IN_TRANSIT');
    expect(result.isOk()).toBe(true);
  });

  it('creates a DELIVERED status', () => {
    const result = DeliveryStatus.create('DELIVERED');
    expect(result.isOk()).toBe(true);
  });

  it('creates a CANCELLED status', () => {
    const result = DeliveryStatus.create('CANCELLED');
    expect(result.isOk()).toBe(true);
  });

  it('rejects an invalid status', () => {
    const result = DeliveryStatus.create('INVALID');
    expect(result.isErr()).toBe(true);
  });

  it('pending() returns a PENDING status', () => {
    const status = DeliveryStatus.pending();
    expect(status.value).toBe('PENDING');
  });

  it('canTransitionTo returns true for valid transitions from PENDING', () => {
    const status = DeliveryStatus.pending();
    expect(status.canTransitionTo('IN_TRANSIT')).toBe(true);
    expect(status.canTransitionTo('CANCELLED')).toBe(true);
  });

  it('canTransitionTo returns false for invalid transitions from PENDING', () => {
    const status = DeliveryStatus.pending();
    expect(status.canTransitionTo('DELIVERED')).toBe(false);
    expect(status.canTransitionTo('PENDING')).toBe(false);
  });

  it('canTransitionTo returns false for terminal statuses', () => {
    const delivered = DeliveryStatus.create('DELIVERED').match(
      (s) => s,
      () => fail('Expected Ok'),
    );
    expect(delivered.canTransitionTo('IN_TRANSIT')).toBe(false);

    const cancelled = DeliveryStatus.create('CANCELLED').match(
      (s) => s,
      () => fail('Expected Ok'),
    );
    expect(cancelled.canTransitionTo('PENDING')).toBe(false);
  });

  it('canTransitionTo allows IN_TRANSIT to DELIVERED', () => {
    const inTransit = DeliveryStatus.create('IN_TRANSIT').match(
      (s) => s,
      () => fail('Expected Ok'),
    );
    expect(inTransit.canTransitionTo('DELIVERED')).toBe(true);
    expect(inTransit.canTransitionTo('CANCELLED')).toBe(true);
  });
});

function fail(message: string): never {
  throw new Error(message);
}
