import { TrackingNumber } from './tracking-number.vo';
import { InvalidDeliveryStatusError } from './delivery-errors';

describe('TrackingNumber', () => {
  it('creates a valid tracking number', () => {
    const result = TrackingNumber.create('TRK123456');
    expect(result.isOk()).toBe(true);
    result.match(
      (vo) => expect(vo.value).toBe('TRK123456'),
      () => fail('Expected Ok'),
    );
  });

  it('trims surrounding whitespace', () => {
    const result = TrackingNumber.create('  TRK123456  ');
    expect(result.isOk()).toBe(true);
    result.match(
      (vo) => expect(vo.value).toBe('TRK123456'),
      () => fail('Expected Ok'),
    );
  });

  it('rejects an empty string', () => {
    const result = TrackingNumber.create('');
    expect(result.isErr()).toBe(true);
  });

  it('rejects a whitespace-only string', () => {
    const result = TrackingNumber.create('   ');
    expect(result.isErr()).toBe(true);
  });

  it('rejects null', () => {
    const result = TrackingNumber.create(null as unknown as string);
    expect(result.isErr()).toBe(true);
  });

  it('rejects undefined', () => {
    const result = TrackingNumber.create(undefined as unknown as string);
    expect(result.isErr()).toBe(true);
  });

  it('returns InvalidDeliveryStatusError on rejection', () => {
    const result = TrackingNumber.create('');
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(InvalidDeliveryStatusError),
    );
  });
});

function fail(message: string): never {
  throw new Error(message);
}
