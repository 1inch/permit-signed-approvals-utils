import {AbiItem} from 'web3-utils';

export const EIP_2612_PERMIT_SELECTOR = '0xd505accf';

export const ERC_20_NONCES_ABI: AbiItem[] = [
    {
        constant: true,
        inputs: [
            {
                name: '',
                type: 'address',
            },
        ],
        name: 'nonces',
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
];

export const EIP_2612_PERMIT_ABI: AbiItem[] = [
    {
        constant: false,
        inputs: [
            {
                name: 'owner',
                type: 'address',
            },
            {
                name: 'spender',
                type: 'address',
            },
            {
                name: 'value',
                type: 'uint256',
            },
            {
                name: 'deadline',
                type: 'uint256',
            },
            {
                name: 'v',
                type: 'uint8',
            },
            {
                name: 'r',
                type: 'bytes32',
            },
            {
                name: 's',
                type: 'bytes32',
            },
        ],
        name: 'permit',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
];
