import { Carrier } from './carrier.vo';
import { InvalidDeliveryStatusError } from './delivery-errors';

describe('Carrier', () => {
  it('creates a valid carrier', () => {
    const result = Carrier.create('DHL');
    expect(result.isOk()).toBe(true);
    result.match(
      (vo) => expect(vo.value).toBe('DHL'),
      () => fail('Expected Ok'),
    );
  });

  it('trims surrounding whitespace', () => {
    const result = Carrier.create('  DHL  ');
    expect(result.isOk()).toBe(true);
    result.match(
      (vo) => expect(vo.value).toBe('DHL'),
      () => fail('Expected Ok'),
    );
  });

  it('rejects an empty string', () => {
    const result = Carrier.create('');
    expect(result.isErr()).toBe(true);
  });

  it('rejects a whitespace-only string', () => {
    const result = Carrier.create('   ');
    expect(result.isErr()).toBe(true);
  });

  it('rejects null', () => {
    const result = Carrier.create(null as unknown as string);
    expect(result.isErr()).toBe(true);
  });

  it('rejects undefined', () => {
    const result = Carrier.create(undefined as unknown as string);
    expect(result.isErr()).toBe(true);
  });

  it('returns InvalidDeliveryStatusError on rejection', () => {
    const result = Carrier.create('');
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(InvalidDeliveryStatusError),
    );
  });
});

function fail(message: string): never {
  throw new Error(message);
}
