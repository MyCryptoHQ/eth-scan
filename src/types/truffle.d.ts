declare module 'truffle' {
  import BN from 'bn.js';
  import Web3 from 'web3';

  global {
    const web3: Web3;
    const artifacts: Artifacts;
  }

  type Accounts = string[];

  interface TransactionDetails {
    from?: string;
    gas?: BN | number | string;
    gasPrice?: BN | number | string;
    value?: BN | string;
  }

  export interface TransactionLog {
    address: string;
    args: any;
    blockHash: string;
    blockNumber: number;
    event: string;
    logIndex: number;
    transactionHash: string;
    transactionIndex: number;
    type: string;
  }

  export interface TransactionResponse {
    tx: string;
    receipt: any;
    logs: TransactionLog[];
  }

  interface Contract<T> extends ContractNew<any[]> {
    address: string;
    contractName: string;

    deployed(): Promise<T>;

    at(address: string): T;
  }

  interface ContractInstance {
    address: string;
    transactionHash: string;
  }

  interface ContractNew<ARGs extends any[]> {
    'new'(...args: ARGs): any;
  }

  interface Deployer {
    link(library: Contract<any>, destination: Contract<any> | Contract<any>[]): Deployer;

    deploy<T extends any[]>(c: ContractNew<T>, ...args: T): Deployer;
  }

  type Migration = (deploy: Deployer, network: string, accounts: Accounts) => void;

  interface Artifacts {
    require<T = any>(name: string): T;
  }
}
