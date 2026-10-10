import { WompiApiService } from './wompi-api.service';
import { WompiApiError } from '@application/domain/transaction/transaction-errors';

const API_URL = 'https://api-sandbox.co.uat.wompi.dev/v1';
const PRIVATE_KEY = 'prv_test_123';

function makeService(): WompiApiService {
  return new WompiApiService({ apiUrl: API_URL, privateKey: PRIVATE_KEY });
}

function mockFetch(response: {
  ok: boolean;
  status: number;
  json?: unknown;
}): void {
  global.fetch = jest.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status,
    json: async () => response.json ?? {},
  }) as unknown as typeof global.fetch;
}

function mockFetchError(error: unknown): void {
  global.fetch = jest.fn().mockRejectedValue(error) as unknown as typeof global.fetch;
}

describe('WompiApiService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getTransactionById', () => {
    it('returns the transaction data on a successful response', async () => {
      mockFetch({
        ok: true,
        status: 200,
        json: {
          data: { id: 'wompi-1', status: 'APPROVED', reference: 'ref-1' },
        },
      });

      const result = await makeService().getTransactionById('wompi-1');

      expect(result.isOk()).toBe(true);
      result.match(
        (data) => {
          expect(data).toEqual({ id: 'wompi-1', status: 'APPROVED', reference: 'ref-1' });
        },
        () => fail('Expected Ok'),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/transactions/wompi-1`,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${PRIVATE_KEY}` },
        }),
      );
    });

    it('returns null on 404', async () => {
      mockFetch({ ok: false, status: 404 });

      const result = await makeService().getTransactionById('nonexistent');

      expect(result.isOk()).toBe(true);
      result.match(
        (data) => expect(data).toBeNull(),
        () => fail('Expected Ok with null'),
      );
    });

    it('returns WompiApiError on HTTP 500', async () => {
      mockFetch({ ok: false, status: 500 });

      const result = await makeService().getTransactionById('wompi-1');

      expect(result.isErr()).toBe(true);
      result.match(
        () => fail('Expected Err'),
        (error) => expect(error).toBeInstanceOf(WompiApiError),
      );
    });

    it('returns WompiApiError on network failure', async () => {
      mockFetchError(new Error('Network error'));

      const result = await makeService().getTransactionById('wompi-1');

      expect(result.isErr()).toBe(true);
      result.match(
        () => fail('Expected Err'),
        (error) => expect(error).toBeInstanceOf(WompiApiError),
      );
    });
  });

  describe('getTransactionByReference', () => {
    it('returns the first transaction from the list', async () => {
      mockFetch({
        ok: true,
        status: 200,
        json: {
          data: [
            { id: 'wompi-1', status: 'DECLINED', reference: 'ref-1' },
            { id: 'wompi-2', status: 'APPROVED', reference: 'ref-2' },
          ],
        },
      });

      const result = await makeService().getTransactionByReference('ref-1');

      expect(result.isOk()).toBe(true);
      result.match(
        (data) => {
          expect(data).toEqual({ id: 'wompi-1', status: 'DECLINED', reference: 'ref-1' });
        },
        () => fail('Expected Ok'),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/transactions?reference=ref-1`,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${PRIVATE_KEY}` },
        }),
      );
    });

    it('returns null when the list is empty', async () => {
      mockFetch({ ok: true, status: 200, json: { data: [] } });

      const result = await makeService().getTransactionByReference('ref-1');

      expect(result.isOk()).toBe(true);
      result.match(
        (data) => expect(data).toBeNull(),
        () => fail('Expected Ok with null'),
      );
    });

    it('encodes the reference in the URL', async () => {
      mockFetch({ ok: true, status: 200, json: { data: [] } });

      await makeService().getTransactionByReference('ref with spaces');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/transactions?reference=ref%20with%20spaces`,
        expect.any(Object),
      );
    });

    it('returns null on 404', async () => {
      mockFetch({ ok: false, status: 404 });

      const result = await makeService().getTransactionByReference('ref-1');

      expect(result.isOk()).toBe(true);
      result.match(
        (data) => expect(data).toBeNull(),
        () => fail('Expected Ok with null'),
      );
    });
  });
});

function fail(message: string): never {
  throw new Error(message);
}
