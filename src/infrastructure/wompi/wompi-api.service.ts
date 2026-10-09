import { ResultAsync } from '@application/domain/shared/result';
import {
  WompiApiPort,
  WompiTransactionData,
} from '@application/ports/gateways/wompi-api.port';
import { WompiApiError } from '@application/domain/transaction/transaction-errors';

export interface WompiApiConfig {
  apiUrl: string;
  privateKey: string;
}

export class WompiApiService implements WompiApiPort {
  constructor(private readonly config: WompiApiConfig) {}

  getTransactionById(
    wompiTransactionId: string,
  ): ResultAsync<WompiTransactionData | null, WompiApiError> {
    return ResultAsync.fromPromise(
      this.doRequest(`${this.config.apiUrl}/transactions/${wompiTransactionId}`).then(
        (data): WompiTransactionData | null =>
          data && !Array.isArray(data) ? (data as WompiTransactionData) : null,
      ),
      (e) => new WompiApiError(`Failed to query Wompi by id: ${String(e)}`),
    );
  }

  getTransactionByReference(
    reference: string,
  ): ResultAsync<WompiTransactionData | null, WompiApiError> {
    const url = `${this.config.apiUrl}/transactions?reference=${encodeURIComponent(reference)}`;
    return ResultAsync.fromPromise(
      this.doRequest(url).then(
        (data): WompiTransactionData | null =>
          Array.isArray(data) ? ((data[0] as WompiTransactionData) ?? null) : (data as WompiTransactionData),
      ),
      (e) => new WompiApiError(`Failed to query Wompi by reference: ${String(e)}`),
    );
  }

  private async doRequest(url: string): Promise<unknown> {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${this.config.privateKey}` },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Wompi API returned status ${response.status}`);
    }

    const json = (await response.json()) as { data?: unknown };
    return json.data ?? null;
  }
}
