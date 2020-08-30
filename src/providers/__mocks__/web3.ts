import { ethers } from '@nomiclabs/buidler';
import { JsonRpcPayload } from '../http';

export default class Web3 {
  currentProvider = {
    send(payload: JsonRpcPayload, callback: (error: Error | null, result: unknown) => void): void {
      const {
        id,
        jsonrpc,
        params: [options]
      } = payload;

      ethers.provider
        .call({
          to: options.to,
          data: options.data
        })
        .then(result => {
          callback(null, {
            id,
            jsonrpc,
            result
          });
        });
    }
  };
}
