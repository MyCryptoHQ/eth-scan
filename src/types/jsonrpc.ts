export interface JsonRpcPayload<T = unknown[]> {
  jsonrpc: string;
  method: string;
  params: T;
  id?: string | number;
}

export type EthCallJsonRpcPayload = JsonRpcPayload<[{ to: string; data: string }, string]>;

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
