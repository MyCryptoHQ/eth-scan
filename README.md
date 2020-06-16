# eth-scan

`eth-scan` is a library written in TypeScript, to help you fetch Ether or (ERC-20) token balances for multiple addresses in an efficient way. The library uses a smart contract to fetch the balances in a single call to a node. The contract is currently deployed at [0x86f25b64e1fe4c5162cdeed5245575d32ec549db](https://etherscan.io/address/0x86f25b64e1fe4c5162cdeed5245575d32ec549db) on the Ethereum mainnet, Goerli, Kovan, Rinkeby and Ropsten.

It can use Web3.js, Ethers.js or regular HTTP as provider to get the balances. See [Getting Started](#getting-started) for more info.

**Note**: Even though `eth_call` doesn't use any gas, the block gas limit still applies, and the maximum number of addresses you can fetch in a single call is limited. By default this library batches calls per 1000 addresses.

## Getting started

The library is published on npm. To install it, use `npm` or `yarn`:

```
yarn add @mycrypto/eth-scan
```

or

```
npm install @mycrypto/eth-scan
```

## Example

```typescript
import { getEtherBalances } from '@mycrypto/eth-scan';

getEtherBalances('http://127.0.0.1:8545', [
  '0x9a0decaffb07fb500ff7e5d253b16892dbec006a',
  '0xeb65f72a2f5464157288ac15f1bb56c56e6be375',
  '0x1b96c634f9e9fcfb76932e165984901701352ffd',
  '0x740539b55ee5dc58efffb88fea44a9008f8daa6f',
  '0x95d9e32dc03770699a6a5e5858165b174d500015'
]).then(console.log);
```

Results in:

```typescript
{
  '0x9a0decaffb07fb500ff7e5d253b16892dbec006a': BigInt(1000000000000000000),
  '0xeb65f72a2f5464157288ac15f1bb56c56e6be375': BigInt(1000000000000000000),
  '0x1b96c634f9e9fcfb76932e165984901701352ffd': BigInt(1000000000000000000),
  '0x740539b55ee5dc58efffb88fea44a9008f8daa6f': BigInt(1000000000000000000),
  '0x95d9e32dc03770699a6a5e5858165b174d500015': BigInt(1000000000000000000)
}
```

## API

### `getEtherBalances(provider, addresses, options)`

Get Ether balances for `addresses`.

* `provider` \<[Provider](#providers)\> - A Web3 instance, Ethers.js provider or JSONRPC endpoint.

* `addresses` \<string[]\> - An array of addresses as hexadecimal string.

* `options` \<[EthScanOptions](#ethscanoptions)\> (optional) - The options to use.

* Returns: \<Promise<[BalanceMap](#balancemap)>\> - A promise with an object with the addresses and the balances.

### `getTokenBalances(provider, addresses, token, options)`

Get ERC-20 token balances from `token` for `addresses`. This does not check if the address specified is a token and will throw an error if it isn't.

* `provider` \<[Provider](#providers)\> - A Web3 instance, Ethers.js provider or JSONRPC endpoint.

* `addresses` \<string[]\> - An array of addresses as hexadecimal string.

* `token` \<string\> - The address of the ERC-20 token.

* `options` \<[EthScanOptions](#ethscanoptions)\> (optional) - The options to use.

* Returns: \<Promise<[BalanceMap](#balancemap)>\> - A promise with an object with the addresses and the balances.

### `getTokensBalance(provider, address, tokens, options)`

Get ERC-20 token balances from `tokens` for `address`. If one of the token addresses specified is not a token, a balance of 0 will be used.

* `provider` \<[Provider](#providers)\> - A Web3 instance, Ethers.js provider or JSONRPC endpoint.

* `address` \<string\> - The address to get token balances for.

* `tokens` \<string[]\> - An array of ERC-20 token addresses.

* `options` \<[EthScanOptions](#ethscanoptions)\> (optional) - The options to use.

* Returns: \<Promise<[BalanceMap](#balancemap)>\> - A promise with an object with the addresses and the balances.

## `getTokensBalances(provider, addresses, tokens, options)`

* `provider` \<[Provider](#providers)\> - A Web3 instance, Ethers.js provider or JSONRPC endpoint.

* `addresses` \<string[]\> - An array of addresses as hexadecimal string.

* `tokens` \<string[]\> - An array of ERC-20 token addresses.

* `options` \<[EthScanOptions](#ethscanoptions)\> (optional) - The options to use.

* Returns: \<Promise<[BalanceMap](#balancemap)\<[BalanceMap](#balancemap)\>>\> - A promise with an object with the addresses and the balances.

### `EthScanOptions`

* `contractAddress` \<string\> (optional) - The address of the smart contract to use. Defaults to [0x86f25b64e1fe4c5162cdeed5245575d32ec549db](https://etherscan.io/address/0x86f25b64e1fe4c5162cdeed5245575d32ec549db).

* `batchSize` \<number\> (optional) - The size of the call batches. Defaults to 1000.

### `BalanceMap`

A `BalanceMap` is an object with an address as key and a [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) as value.

### Providers

Currently, `eth-scan` has support for three different providers:

* Ethers.js, by using an existing Ethers.js provider
* Web3, by using an instance of the `Web3` class
* HTTP, by using a URL of a JSONRPC endpoint as string

## Compatiblity

`eth-scan` uses ES6+ functionality, which may not be supported on all platforms. If you need compatibility with older browsers or Node.js versions, you can use something like [Babel](https://github.com/babel/babel).

There is an ES compatible version available, which should work with module bundlers like [Webpack](https://webpack.js.org/) and [Rollup](https://github.com/rollup/rollup).
