import Provider from './provider';
import 'isomorphic-unfetch';

/**
 * Get the JSON-RPC payload for the `eth_call` function.
 *
 * @param {string} to The address to send the call to, as a hexadecimal string.
 * @param {string} data The data to send to the address, as a hexadecimal string.
 */
export const getPayload = <Data>(to: string, data: Data): string => {
  const callData = {
    jsonrpc: '2.0',
    method: 'eth_call',
    params: [
      {
        to,
        data
      },
      'latest'
    ],
    id: 1
  };

  return JSON.stringify(callData);
};

export interface JsonRpcResult<T> {
  id: number;
  jsonrpc: string;
  result: T;
  error?: {
    code: number;
    message: string;
    data: string;
  };
}

/**
 * A provider that does not rely on any external libraries. Uses simple HTTP requests to make the
 * calls.
 */
export default class HttpProvider extends Provider {
  /**
   * Create an instance of the HttpProvider class.
   *
   * @param {string} url The URL of the provider.
   * @param {Omit<RequestInit, 'cache' | 'body' | 'method'>} params Optional HTTP request
   *   parameters to pass to the `fetch()` method.
   */
  public constructor(
    public readonly url: string,
    public readonly params: Partial<Omit<RequestInit, 'cache' | 'body' | 'method'>> = {}
  ) {
    super();
  }

  /**
   * Wrapper function for `eth_call`.
   *
   * @param {string} address The address to send the call to.
   * @param {string} data The data for the transaction.
   * @return {Promise<string>} A Promise with the response data.
   */
  public async call(address: string, data: string): Promise<string> {
    const json = getPayload(address, data);

    const body = await fetch(this.url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: json,
      cache: 'no-cache',
      ...this.params
    });

    const response: JsonRpcResult<string> = await body.json();

    if (response.error) {
      throw new Error(`Contract call failed: ${response.error.message}`);
    }

    return response.result;
  }
}
