// ─────────────────────────────────────────────
// Result<T, E> — Railway Oriented Programming
// ─────────────────────────────────────────────

export class Ok<T> {
  private readonly _value: T;

  constructor(value: T) {
    this._value = value;
  }

  get value(): T {
    return this._value;
  }

  isOk(): boolean {
    return true;
  }

  isErr(): boolean {
    return false;
  }

  map<U>(fn: (value: T) => U): Result<U, never> {
    return ok(fn(this._value));
  }

  mapErr<F>(_fn: (error: never) => F): Result<T, F> {
    return this as unknown as Result<T, F>;
  }

  andThen<U, F>(fn: (value: T) => Result<U, F>): Result<U, F> {
    return fn(this._value);
  }

  tap(fn: (value: T) => void): Result<T, never> {
    fn(this._value);
    return this as unknown as Result<T, never>;
  }

  match<U>(onOk: (value: T) => U, _onErr: (error: never) => U): U {
    return onOk(this._value);
  }

  unwrapOr<U>(_defaultValue: U): T | U {
    return this._value;
  }
}

export class Err<E> {
  private readonly _error: E;

  constructor(error: E) {
    this._error = error;
  }

  get error(): E {
    return this._error;
  }

  isOk(): boolean {
    return false;
  }

  isErr(): boolean {
    return true;
  }

  map<U>(_fn: (value: never) => U): Result<U, E> {
    return this as unknown as Result<U, E>;
  }

  mapErr<F>(fn: (error: E) => F): Result<never, F> {
    return err(fn(this._error));
  }

  andThen<U, F>(_fn: (value: never) => Result<U, F>): Result<U, F> {
    return this as unknown as Result<U, F>;
  }

  tap(_fn: (value: never) => void): Result<never, E> {
    return this as unknown as Result<never, E>;
  }

  match<U>(_onOk: (value: never) => U, onErr: (error: E) => U): U {
    return onErr(this._error);
  }

  unwrapOr<U>(defaultValue: U): U {
    return defaultValue;
  }
}

export type Result<T, E> = Ok<T> | Err<E>;

// ── Helpers ──

export function ok<T>(value: T): Ok<T> {
  return new Ok(value);
}

export function err<E>(error: E): Err<E> {
  return new Err(error);
}

// ─────────────────────────────────────────────
// ResultAsync<T, E>
// ─────────────────────────────────────────────

export class ResultAsync<T, E> implements PromiseLike<Result<T, E>> {
  constructor(private readonly promise: Promise<Result<T, E>>) {}

  then<A, B>(
    onfulfilled?: ((value: Result<T, E>) => A | PromiseLike<A>) | null,
    onrejected?: ((reason: unknown) => B | PromiseLike<B>) | null,
  ): Promise<A | B> {
    return this.promise.then(onfulfilled, onrejected);
  }

  map<U>(fn: (value: T) => U): ResultAsync<U, E> {
    return new ResultAsync(this.promise.then((r) => r.map(fn)));
  }

  mapErr<F>(fn: (error: E) => F): ResultAsync<T, F> {
    return new ResultAsync(this.promise.then((r) => r.mapErr(fn)));
  }

  andThen<U, F>(
    fn: (value: T) => Result<U, F> | ResultAsync<U, F>,
  ): ResultAsync<U, E | F> {
    return new ResultAsync(
      this.promise.then(async (r) => {
        if (r instanceof Err) return r as unknown as Result<U, E | F>;
        const next = fn(r.value);
        if (next instanceof ResultAsync) {
          return (await next) as unknown as Result<U, E | F>;
        }
        return next as unknown as Result<U, E | F>;
      }),
    );
  }

  tap(fn: (value: T) => void): ResultAsync<T, E> {
    return new ResultAsync(
      this.promise.then((r) => {
        r.tap(fn);
        return r;
      }),
    );
  }

  async match<U>(
    onOk: (value: T) => U,
    onErr: (error: E) => U,
  ): Promise<U> {
    const r = await this.promise;
    return r.match(onOk, onErr);
  }

  async unwrapOr<U>(defaultValue: U): Promise<T | U> {
    const r = await this.promise;
    return r.unwrapOr(defaultValue);
  }

  // ── Static helpers ──

  static fromPromise<T, E>(
    p: Promise<T>,
    mapError: (error: unknown) => E,
  ): ResultAsync<T, E> {
    return new ResultAsync(
      p.then((v) => ok(v)).catch((e) => err(mapError(e))),
    );
  }

  static combine<T, E>(results: ResultAsync<T, E>[]): ResultAsync<T[], E> {
    return new ResultAsync(
      Promise.all(results).then((rs) => {
        for (const r of rs) {
          if (r instanceof Err) return r as unknown as Result<T[], E>;
        }
        return ok(rs.map((r) => (r as Ok<T>).value));
      }),
    );
  }
}

export function okAsync<T>(value: T): ResultAsync<T, never> {
  return new ResultAsync(Promise.resolve(ok(value)));
}

export function errAsync<E>(error: E): ResultAsync<never, E> {
  return new ResultAsync(Promise.resolve(err(error)));
}
