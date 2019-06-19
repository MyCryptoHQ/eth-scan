# eth-scan

`eth-scan` is a library written in TypeScript, to help you fetch Ether or (ERC-20) token balances for multiple addresses in an efficient way. The library uses a smart contract to fetch the balances in a single call to a node. The contract is currently deployed at [0x9faa157a8166a1a0db7da851da458d5c13855541](https://etherscan.io/address/0x9faa157a8166a1a0db7da851da458d5c13855541) on the Ethereum mainnet.

It can use Web3.js, Ethers.js or regular HTTP as provider to get the balances. See [Getting Started](#getting-started) for more info.

**Note**: Even though `eth_call` doesn't use any gas, the block gas limit still applies, and the maximum number of addresses you can fetch in a single call is limited. By default this library batches calls per 1000 addresses.

## Getting started

The library is published on npm. To install it, use `npm` or `yarn`:

```
yarn add eth-scan
```

or

```
npm install eth-scan
```

## Example

```typescript
import EthScan, { HttpProvider } from 'eth-scan';

const scanner = new EthScan(new HttpProvider('http://127.0.0.1:8545'));

scanner.getEtherBalances([
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
  '0x9a0decaffb07fb500ff7e5d253b16892dbec006a': 1000000000000000000n,
  '0xeb65f72a2f5464157288ac15f1bb56c56e6be375': 1000000000000000000n,
  '0x1b96c634f9e9fcfb76932e165984901701352ffd': 1000000000000000000n,
  '0x740539b55ee5dc58efffb88fea44a9008f8daa6f': 1000000000000000000n,
  '0x95d9e32dc03770699a6a5e5858165b174d500015': 1000000000000000000n
}
```

Note that this library uses the native JavaScript `BigInt` type, which [currently does not work in all browsers](https://caniuse.com/#feat=bigint). Use a polyfill if your application requires support for other browsers.

## API

### EthScan

#### `new EthScan(provider, options?)`

The main class used to get Ether or token balances.

* `provider` \<[Provider](#providers)\> - An instance of the Web3.js, Ethers.js or HTTP provider class.

* `options` \<[EthScanOptions](#ethscanoptions)\> (optional) - The options to use.

##### `getEtherBalances(addresses)`

Get Ether balances for `addresses`.

* `addresses` \<string[]\> - An array of addresses as hexadecimal string.

* Returns: \<Promise\> - A promise with an object with the addresses and the balances.

##### `getTokenBalances(addresses, token)`

Get ERC-20 token balances from `token` for `addresses`. This does not check if the address specified is a token and will throw an error if it isn't.

* `addresses` \<string[]\> - An array of addresses as hexadecimal string.

* `token` \<string\> - The address of the ERC-20 token.

* Returns: \<Promise\> - A promise with an object with the addresses and the balances.

##### `getTokensBalance(address, tokens)`

Get ERC-20 token balances from `tokens` for `address`. If one of the token addresses specified is not a token, a balance of 0 will be used.

* `address` \<string\> - The address to get token balances for.

* `tokens` \<string[]\> - An array of ERC-20 token addresses.

* Returns: \<Promise\> - A promise with an object with the addresses and the balances.

#### `EthScanOptions`

* `contractAddress` \<string\> (optional) - The address of the smart contract to use. Defaults to [0x82Ea2E7834Bb0D6224dd6fd7125d44b83d6D6809](https://etherscan.io/address/0x82Ea2E7834Bb0D6224dd6fd7125d44b83d6D6809).

* `batchSize` \<number\> (optional) - The size of the call batches. Defaults to 1000.

### Providers

There are currently three available providers.

#### `new EthersProvider(provider)`

Create a provider from an existing Ethers.js provider.

* `provider` \<Provider\> - An instance of an Ethers.js provider.

#### `new HttpProvider(url)`

Create a provider that uses a simple HTTP request.

* `url` \<string\> - The URL of the node to connect to.

#### `new Web3Provider(web3)`

Create a provider from an existing Web3.js instance.

* `web3` \<Web3\> - An instance of the Web3 class.
