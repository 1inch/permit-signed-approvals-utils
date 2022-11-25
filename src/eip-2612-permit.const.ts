import {AbiInput, AbiItem} from 'web3-utils';
import {EIP712Parameter} from './model/eip712.model';

export const EIP_2612_PERMIT_SELECTOR = '0xd505accf';
export const DAI_PERMIT_SELECTOR = '0x8fcbaf0c';

export const DOMAINS_WITHOUT_VERSION = [
    /** @signature 'EIP712Domain(string name,uint chainId,address verifyingContract)' */
    '0x797cfab58fcb15f590eb8e4252d5c228ff88f94f907e119e80c4393a946e8f35',
    /** @signature 'EIP712Domain(string name,uint256 chainId,address verifyingContract)' */
    '0x8cad95687ba82c2ce50e74f7b754645e5117c3a5bec8151c0726d5857980a866',
];

/**
 * @signature EIP712Domain(string name,string version,address verifyingContract,bytes32 salt)
 * */
export const DOMAIN_WITH_SALT_ADN_WITHOUT_CHAIN_ID =
    '0x36c25de3e541d5d970f66e4210d728721220fff5c077cc6cd008b3a0c62adab7'


/**
 * @signature Permit(address holder,address spender,uint256 nonce,uint256 expiry,bool allowed)
 * */
export const DAI_LIKE_PERMIT_TYPEHASH =
    '0xea2aa0a1be11a07ed86d755c93467f4f82362b452371d1ba94d1715123511acb';

/**
 * @example `${tokenAddress}:${chainId}.toLowerCase()`
 * @warning Only toLowerCase string
 * */
export const TOKEN_ADDRESSES_WITH_SALT = [
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174:137', // USDC Proxy Polygon
    '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063:137', // DAI Proxy Polygon
]

export const eip2612PermitModelFields: EIP712Parameter[] = [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
];

export const daiPermitModelFields: EIP712Parameter[] = [
    { name: 'holder', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'expiry', type: 'uint256' },
    { name: 'allowed', type: 'bool' },
];

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
    {
        constant: true,
        inputs: [
            {
                name: '',
                type: 'address',
            },
        ],
        name: '_nonces',
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
    {
        constant: true,
        inputs: [
            {
                name: '',
                type: 'address',
            },
        ],
        name: 'nonce',
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
    {
        constant: true,
        inputs: [
            {
                name: '',
                type: 'address',
            },
        ],
        name: 'getNonce', // dai polygon
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

export const EIP_2612_PERMIT_INPUTS = EIP_2612_PERMIT_ABI[0].inputs as AbiInput[];


export const DAI_EIP_2612_PERMIT_ABI: AbiItem[] = [
    {
        constant: false,
        inputs: [
            {
                internalType: 'address',
                name: 'holder',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'spender',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'nonce',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'expiry',
                type: 'uint256',
            },
            {
                internalType: 'bool',
                name: 'allowed',
                type: 'bool',
            },
            {
                internalType: 'uint8',
                name: 'v',
                type: 'uint8',
            },
            {
                internalType: 'bytes32',
                name: 'r',
                type: 'bytes32',
            },
            {
                internalType: 'bytes32',
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

export const DAI_EIP_2612_PERMIT_INPUTS = DAI_EIP_2612_PERMIT_ABI[0].inputs as AbiInput[];

export const DOMAIN_TYPEHASH_ABI: AbiItem[] = [
    {
        constant: true,
        inputs: [],
        name: 'DOMAIN_TYPEHASH',
        outputs: [
            {
                internalType: 'bytes32',
                name: '',
                type: 'bytes32',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
];

export const PERMIT_TYPEHASH_ABI: AbiItem[] = [
    {
        constant: true,
        inputs: [],
        name: 'PERMIT_TYPEHASH',
        outputs: [
            {
                internalType: 'bytes32',
                name: '',
                type: 'bytes32',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
];

export const DOMAIN_SEPARATOR_ABI: AbiItem[] = [
    {
        inputs: [],
        name: 'DOMAIN_SEPARATOR',
        outputs: [
            {
                internalType: 'bytes32',
                name: '',
                type: 'bytes32',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
];
