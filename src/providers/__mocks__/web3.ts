import { JsonRpcPayload } from '../http';
import { ethers } from '@nomiclabs/buidler';

export default class Web3 {
  public currentProvider = {
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
