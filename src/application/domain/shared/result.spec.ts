import { describe, it, expect } from 'vitest';
import {
  Result,
  Ok,
  Err,
  ResultAsync,
  ok,
  err,
  okAsync,
  errAsync,
} from './result';

describe('Result', () => {
  // ── ok / err constructors ──

  describe('ok', () => {
    it('creates an Ok with the given value', () => {
      const r = ok(42);
      expect(r).toBeInstanceOf(Ok);
      expect(r.isOk()).toBe(true);
      expect(r.isErr()).toBe(false);
      expect(r.value).toBe(42);
    });

    it('preserves reference types', () => {
      const obj = { a: 1 };
      const r = ok(obj);
      expect(r.value).toBe(obj);
    });
  });

  describe('err', () => {
    it('creates an Err with the given error', () => {
      const r = err('boom');
      expect(r).toBeInstanceOf(Err);
      expect(r.isOk()).toBe(false);
      expect(r.isErr()).toBe(true);
      expect(r.error).toBe('boom');
    });
  });

  // ── map ──

  describe('map', () => {
    it('applies the function on Ok', () => {
      const r = ok(5).map((n) => n * 2);
      expect(r.isOk()).toBe(true);
      expect((r as Ok<number>).value).toBe(10);
    });

    it('skips the function on Err', () => {
      const r = err<string, string>('error').map((n) => n.toUpperCase());
      expect(r.isErr()).toBe(true);
      expect((r as Err<string>).error).toBe('error');
    });
  });

  // ── mapErr ──

  describe('mapErr', () => {
    it('skips the function on Ok', () => {
      const r = ok(5).mapErr((e: string) => e.toUpperCase());
      expect(r.isOk()).toBe(true);
      expect((r as Ok<number>).value).toBe(5);
    });

    it('applies the function on Err', () => {
      const r = err('boom').mapErr((e) => e.toUpperCase());
      expect(r.isErr()).toBe(true);
      expect((r as Err<string>).error).toBe('BOOM');
    });
  });

  // ── andThen ──

  describe('andThen', () => {
    it('chains on Ok', () => {
      const r = ok(5).andThen((n) => ok(n + 1));
      expect(r.isOk()).toBe(true);
      expect((r as Ok<number>).value).toBe(6);
    });

    it('short-circuits on Err', () => {
      const r = err<number, string>('error').andThen((n) => ok(n + 1));
      expect(r.isErr()).toBe(true);
      expect((r as Err<string>).error).toBe('error');
    });

    it('propagates inner Err', () => {
      const r = ok(5).andThen((_n) => err('inner error'));
      expect(r.isErr()).toBe(true);
      expect((r as Err<string>).error).toBe('inner error');
    });
  });

  // ── tap ──

  describe('tap', () => {
    it('calls the side-effect on Ok and returns the same Result', () => {
      let captured = 0;
      const r = ok(5).tap((n) => {
        captured = n;
      });
      expect(captured).toBe(5);
      expect(r.isOk()).toBe(true);
      expect((r as Ok<number>).value).toBe(5);
    });

    it('does not call the side-effect on Err', () => {
      let called = false;
      const r = err('error').tap((_n) => {
        called = true;
      });
      expect(called).toBe(false);
      expect(r.isErr()).toBe(true);
    });
  });

  // ── match ──

  describe('match', () => {
    it('calls onOk for Ok', () => {
      const result = ok(5).match(
        (v) => `ok:${v}`,
        (e) => `err:${e}`,
      );
      expect(result).toBe('ok:5');
    });

    it('calls onErr for Err', () => {
      const result = err('boom').match(
        (v: number) => `ok:${v}`,
        (e) => `err:${e}`,
      );
      expect(result).toBe('err:boom');
    });
  });

  // ── unwrapOr ──

  describe('unwrapOr', () => {
    it('returns the value on Ok', () => {
      expect(ok(5).unwrapOr(0)).toBe(5);
    });

    it('returns the default on Err', () => {
      expect(err('error').unwrapOr(0)).toBe(0);
    });
  });
});

describe('ResultAsync', () => {
  // ── okAsync / errAsync ──

  it('okAsync resolves to Ok', async () => {
    const r = await okAsync(42);
    expect(r.isOk()).toBe(true);
    expect((r as Ok<number>).value).toBe(42);
  });

  it('errAsync resolves to Err', async () => {
    const r = await errAsync('boom');
    expect(r.isErr()).toBe(true);
    expect((r as Err<string>).error).toBe('boom');
  });

  // ── map ──

  it('map applies on Ok', async () => {
    const r = await okAsync(5).map((n) => n * 2);
    expect(r.isOk()).toBe(true);
    expect((r as Ok<number>).value).toBe(10);
  });

  it('map skips on Err', async () => {
    const r = await errAsync('error').map((n: number) => n * 2);
    expect(r.isErr()).toBe(true);
    expect((r as Err<string>).error).toBe('error');
  });

  // ── mapErr ──

  it('mapErr applies on Err', async () => {
    const r = await errAsync('boom').mapErr((e) => e.toUpperCase());
    expect(r.isErr()).toBe(true);
    expect((r as Err<string>).error).toBe('BOOM');
  });

  // ── andThen ──

  it('andThen chains sync Result on Ok', async () => {
    const r = await okAsync(5).andThen((n) => ok(n + 1));
    expect(r.isOk()).toBe(true);
    expect((r as Ok<number>).value).toBe(6);
  });

  it('andThen chains ResultAsync on Ok', async () => {
    const r = await okAsync(5).andThen((n) => okAsync(n + 1));
    expect(r.isOk()).toBe(true);
    expect((r as Ok<number>).value).toBe(6);
  });

  it('andThen short-circuits on Err', async () => {
    const r = await errAsync<number, string>('error').andThen((n) =>
      ok(n + 1),
    );
    expect(r.isErr()).toBe(true);
    expect((r as Err<string>).error).toBe('error');
  });

  // ── tap ──

  it('tap calls side-effect on Ok', async () => {
    let captured = 0;
    await okAsync(5).tap((n) => {
      captured = n;
    });
    expect(captured).toBe(5);
  });

  // ── match ──

  it('match calls onOk for Ok', async () => {
    const result = await okAsync(5).match(
      (v) => `ok:${v}`,
      (e) => `err:${e}`,
    );
    expect(result).toBe('ok:5');
  });

  it('match calls onErr for Err', async () => {
    const result = await errAsync('boom').match(
      (v: number) => `ok:${v}`,
      (e) => `err:${e}`,
    );
    expect(result).toBe('err:boom');
  });

  // ── unwrapOr ──

  it('unwrapOr returns value on Ok', async () => {
    const result = await okAsync(5).unwrapOr(0);
    expect(result).toBe(5);
  });

  it('unwrapOr returns default on Err', async () => {
    const result = await errAsync('error').unwrapOr(0);
    expect(result).toBe(0);
  });

  // ── fromPromise ──

  describe('fromPromise', () => {
    it('resolves to Ok on success', async () => {
      const r = await ResultAsync.fromPromise(
        Promise.resolve(42),
        () => 'fallback error',
      );
      expect(r.isOk()).toBe(true);
      expect((r as Ok<number>).value).toBe(42);
    });

    it('resolves to Err on failure', async () => {
      const r = await ResultAsync.fromPromise(
        Promise.reject(new Error('boom')),
        (e) => (e as Error).message,
      );
      expect(r.isErr()).toBe(true);
      expect((r as Err<string>).error).toBe('boom');
    });
  });

  // ── combine ──

  describe('combine', () => {
    it('returns all values when all are Ok', async () => {
      const r = await ResultAsync.combine([
        okAsync(1),
        okAsync(2),
        okAsync(3),
      ]);
      expect(r.isOk()).toBe(true);
      expect((r as Ok<number[]>).value).toEqual([1, 2, 3]);
    });

    it('returns the first Err when any fails', async () => {
      const r = await ResultAsync.combine([
        okAsync(1),
        errAsync('boom'),
        okAsync(3),
      ]);
      expect(r.isErr()).toBe(true);
      expect((r as Err<string>).error).toBe('boom');
    });
  });

  // ── PromiseLike interop ──

  it('works with await (PromiseLike)', async () => {
    const r: Result<number, string> = await okAsync(5);
    expect(r.isOk()).toBe(true);
  });
});
