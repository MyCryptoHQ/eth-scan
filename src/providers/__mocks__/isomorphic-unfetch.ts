import { ethers } from 'hardhat';
import { JsonRpcResult } from '../http';

/**
 * Proxies any fetch request to use the Ethers.js object provided by Buidler.
 */
export default (url: string, { body }: { body: string }): { json(): Promise<JsonRpcResult<unknown>> } => {
  const {
    id,
    jsonrpc,
    params: [options]
  } = JSON.parse(body);

  return {
    async json() {
      const result = await ethers.provider.call({
        to: options.to,
        data: options.data
      });

      return {
        id,
        jsonrpc,
        result
      };
    }
  };
};
