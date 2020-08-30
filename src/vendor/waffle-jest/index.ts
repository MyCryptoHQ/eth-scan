import { bigNumberMatchers } from './matchers/bigNumber';
import { toBeCalledOnContract } from './matchers/calledOnContract/calledOnContract';
import { toBeCalledOnContractWith } from './matchers/calledOnContract/calledOnContractWith';
import { toBeProperAddress } from './matchers/toBeProperAddress';
import { toBeProperHex } from './matchers/toBeProperHex';
import { toBeProperPrivateKey } from './matchers/toBeProperPrivateKey';
import { toBeReverted } from './matchers/toBeReverted';
import { toBeRevertedWith } from './matchers/toBeRevertedWith';
import { toChangeBalance } from './matchers/toChangeBalance';
import { toChangeBalances } from './matchers/toChangeBalances';
import { toHaveEmitted } from './matchers/toHaveEmitted/toHaveEmitted';
import { toHaveEmittedWith } from './matchers/toHaveEmitted/toHaveEmittedWith';

export const waffleJest = {
  // misc matchers
  toBeProperAddress,
  toBeProperPrivateKey,
  toBeProperHex,

  // BigNumber matchers
  ...bigNumberMatchers,

  // balance matchers
  toChangeBalance,
  toChangeBalances,

  // revert matchers
  toBeReverted,
  toBeRevertedWith,

  // emit matchers
  toHaveEmitted,
  toHaveEmittedWith,

  // calledOnContract matchers
  toBeCalledOnContract,
  toBeCalledOnContractWith
};
