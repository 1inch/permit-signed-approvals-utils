<p align="center">
  <img src="https://app.1inch.io/assets/images/logo.svg" width="200" alt="1inch network" />
</p>

# Utils library for EIP-2612: permit based on EIP-712 signed approvals

This is the package of utilities for building signature and call data of EIP-2612 permits

## Specification

### https://eips.ethereum.org/EIPS/eip-2612

## Test coverage

| Statements                                                                     | Branches                                                                    | Functions                                                                     | Lines                                                                |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| ![Statements](https://img.shields.io/badge/statements-99.13%25-brightgreen.svg) | ![Branches](https://img.shields.io/badge/branches-95.74%25-brightgreen.svg) | ![Functions](https://img.shields.io/badge/functions-93.55%25-brightgreen.svg) | ![Lines](https://img.shields.io/badge/lines-99.13%25-brightgreen.svg) |

## Installation

### Node

```
npm install @1inch/permit-signed-approvals-utils
```

### Yarn

```
yarn add @1inch/permit-signed-approvals-utils
```

---

## Contributing

See [CONTRIBUTING.md](https://github.com/1inch/limit-order-protocol-utils/blob/master/CONTRIBUTING.md)

## Changelog

See [CHANGELOG.md](https://github.com/1inch/limit-order-protocol-utils/blob/master/CHANGELOG.md)

---

## About

### Build permit signature

```typescript
import {
    Eip2612PermitUtils,
    Web3ProviderConnector,
    PermitParams,
} from '@1inch/permit-signed-approvals-utils';
import Web3 from 'web3';

const chainId = 1;
const contractAddress = '0x11111112542d85b3ef69ae05771c2dccff4faa26';
const tokenAddress = '0x111111111117dc0aa78b770fa6a738034120c302';
const tokenName = '1INCH Token';
const walletAddress = '0x2c9b2dbdba8a9c969ac24153f5c1c23cb0e63914';
const privateKey =
    '965e092fdfc08940d2bd05c7b5c7e1c51e283e92c7f52bbf1408973ae9a9acb7';

const permitParams: PermitParams = {
    owner: walletAddress,
    spender: contractAddress,
    value: '1000000000',
    nonce: 0,
    deadline: 192689033,
};

const web3 = new Web3('...');
// You can create and use a custom provider connector (for example: ethers)
// For server side, you can use: new PrivateKeyProviderConnector(privateKey, web3);
const connector = new Web3ProviderConnector(web3);
const eip2612PermitUtils = new Eip2612PermitUtils(connector);

const signature = await eip2612PermitUtils.buildPermitSignature(
    {
        ...permitParams,
        nonce: await eip2612PermitUtils.getTokenNonce(
            tokenAddress,
            walletAddress
        ),
    },
    chainId,
    tokenName,
    tokenAddress
);

console.log('Permit signature', signature);
```

### Build permit call data

```typescript
import {
    Eip2612PermitUtils,
    Web3ProviderConnector,
    PermitParams,
} from '@1inch/permit-signed-approvals-utils';
import Web3 from 'web3';

const chainId = 1;
const contractAddress = '0x11111112542d85b3ef69ae05771c2dccff4faa26';
const tokenAddress = '0x111111111117dc0aa78b770fa6a738034120c302';
const tokenName = '1INCH Token';
const walletAddress = '0x2c9b2dbdba8a9c969ac24153f5c1c23cb0e63914';
const privateKey =
    '965e092fdfc08940d2bd05c7b5c7e1c51e283e92c7f52bbf1408973ae9a9acb7';

const permitParams: PermitParams = {
    owner: walletAddress,
    spender: contractAddress,
    value: '1000000000',
    nonce: 0,
    deadline: 192689033,
};

const web3 = new Web3('...');
// You can create and use a custom provider connector (for example: ethers)
// For server side, you can use: new PrivateKeyProviderConnector(privateKey, web3);
const connector = new Web3ProviderConnector(web3);
const eip2612PermitUtils = new Eip2612PermitUtils(connector);

const callData = await eip2612PermitUtils.buildPermitCallData(
    {
        ...permitParams,
        nonce: await eip2612PermitUtils.getTokenNonce(
            tokenAddress,
            walletAddress
        ),
    },
    chainId,
    tokenName,
    tokenAddress
);

console.log('Permit call data', callData);
```

### Get nonce from a token contract

```typescript
import {
    Eip2612PermitUtils,
    Web3ProviderConnector,
} from '@1inch/permit-signed-approvals-utils';
import Web3 from 'web3';

const tokenAddress = '0x111111111117dc0aa78b770fa6a738034120c302';
const walletAddress = '0x2c9b2dbdba8a9c969ac24153f5c1c23cb0e63914';
const privateKey =
    '965e092fdfc08940d2bd05c7b5c7e1c51e283e92c7f52bbf1408973ae9a9acb7';

const web3 = new Web3('...');
// You can create and use a custom provider connector (for example: ethers)
// For server side, you can use: new PrivateKeyProviderConnector(privateKey, web3);
const connector = new Web3ProviderConnector(web3);
const eip2612PermitUtils = new Eip2612PermitUtils(connector);

const nonce = await eip2612PermitUtils.getTokenNonce(
    tokenAddress,
    walletAddress
);

console.log('Nonce', nonce);
```

### Recover permit owner from call data

```typescript
import {
    Eip2612PermitUtils,
    Web3ProviderConnector,
} from '@1inch/permit-signed-approvals-utils';
import Web3 from 'web3';

const callData = '0x......0000';

const chainId = 56;
const tokenName = '1INCH';
const tokenAddress = '0x111111111117dc0aa78b770fa6a738034120c302';
const walletAddress = '0x2c9b2dbdba8a9c969ac24153f5c1c23cb0e63914';
const privateKey =
    '965e092fdfc08940d2bd05c7b5c7e1c51e283e92c7f52bbf1408973ae9a9acb7';

const web3 = new Web3('...');
// You can create and use a custom provider connector (for example: ethers)
// For server side, you can use: new PrivateKeyProviderConnector(privateKey, web3);
const connector = new Web3ProviderConnector(web3);
const eip2612PermitUtils = new Eip2612PermitUtils(connector);

const result = await eip2612PermitUtils.recoverPermitOwnerFromCallData({
    chainId,
    tokenName,
    tokenAddress,
    callData
});

// OR

const syncResult = eip2612PermitUtils.syncRecoverPermitOwnerFromCallData({
    chainId,
    tokenName,
    tokenAddress,
    callData,
    nonce: 1,
});

// OR (for DAI-like tokens)

const daiLikeResult = await eip2612PermitUtils.recoverDaiLikePermitOwnerFromCallData({
    chainId,
    tokenName: 'DAI',
    tokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
    callData,
    nonce: 1,
});

console.log('Result', result);
console.log('SyncResult', syncResult);
console.log('DaiLikeResult', daiLikeResult);
```
