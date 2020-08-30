import { BigNumber, Wallet, Contract } from 'ethers'; // eslint-disable-line @typescript-eslint/no-unused-vars

export type Numberish = number | string | BigNumber;

declare global {
  namespace jest {
    interface Matchers<R> {
      // misc matchers
      toBeProperAddress(): R;
      toBeProperPrivateKey(): R;
      toBeProperHex(length: number): R;

      // BigNumber matchers
      toEqBN(value: Numberish): R;
      toBeGtBN(value: Numberish): R;
      toBeLtBN(value: Numberish): R;
      toBeGteBN(value: Numberish): R;
      toBeLteBN(value: Numberish): R;

      // balance matchers
      toChangeBalance(wallet: Wallet, balanceChange: Numberish): R;
      toChangeBalances(wallets: Wallet[], balanceChanges: Numberish[]): R;

      // revert matchers
      toBeReverted(): R;
      toBeRevertedWith(revertReason: string): R;

      // emit matcher
      toHaveEmitted(contract: Contract, eventName: string): R;
      toHaveEmittedWith(contract: Contract, eventName: string, expectedArgs: any[]): R;

      // calledOnContract matchers
      toBeCalledOnContract(contract: Contract): R;
      toBeCalledOnContractWith(contract: Contract, parameters: any[]): R;
    }
  }
}

export {};
