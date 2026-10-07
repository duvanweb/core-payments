import { CheckHealthUseCase } from './check-health.use-case';

describe('CheckHealthUseCase', () => {
  it('returns Ok with status "ok"', async () => {
    const useCase = new CheckHealthUseCase();
    const result = await useCase.execute();

    expect(result.isOk()).toBe(true);
    expect(result.isErr()).toBe(false);
  });

  it('returns a result with status "ok" and a timestamp', async () => {
    const useCase = new CheckHealthUseCase();
    const result = await useCase.execute();

    result.match(
      (value) => {
        expect(value.status).toBe('ok');
        expect(value.timestamp).toBeInstanceOf(Date);
      },
      () => fail('Expected Ok, got Err'),
    );
  });
});

function fail(message: string): never {
  throw new Error(message);
}
