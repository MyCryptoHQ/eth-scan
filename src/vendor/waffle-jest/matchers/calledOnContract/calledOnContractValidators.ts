import { MockProvider } from '@ethereum-waffle/provider';
import { Contract } from 'ethers';
import { ProviderWithHistoryExpected } from './error';
import { ensure } from './utils';

export function validateContract(contract: any): asserts contract is Contract {
  ensure(contract instanceof Contract, TypeError, 'argument must be a contract');
}

export function validateMockProvider(provider: any): asserts provider is MockProvider {
  ensure(!!provider.callHistory && provider.callHistory instanceof Array, ProviderWithHistoryExpected);
}

export function validateFnName(fnName: any, contract: Contract): asserts fnName is string {
  ensure(typeof fnName === 'string', TypeError, 'function name must be a string');
  function isFunction(name: string) {
    try {
      return !!contract.interface.getFunction(name);
    } catch (e) {
      return false;
    }
  }
  ensure(isFunction(fnName), TypeError, 'function must exist in provided contract');
}
