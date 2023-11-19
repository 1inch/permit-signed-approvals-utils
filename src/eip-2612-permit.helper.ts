import Web3 from 'web3';
import { eip2612PermitModelFields, TOKEN_ADDRESSES_WITH_SALT } from './eip-2612-permit.const';
import { EIP712Object, EIP712TypedData } from './model/eip712.model';
import { DaiPermitParams, PermitParams } from './model/permit.model';
import {PermitTypedDataParamsModel} from './model/permit-typed-data-params.model';
import { AllowanceTransfer } from "@uniswap/permit2-sdk";
import { Eip712Permit2 } from "./model/eip712-permit2.model";

export function inputIsNotNullOrUndefined<T>(
    input: null | undefined | T
): input is T {
    return input !== null && input !== undefined;
}

// eslint-disable-next-line max-lines-per-function
export function buildPermitTypedData(data: PermitTypedDataParamsModel): EIP712TypedData {
    const {
        chainId,
        tokenName,
        tokenAddress: verifyingContract,
        params,
        isDomainWithoutVersion = false,
        isSaltInsteadOfChainId = false,
        version = '1',
        permitModelFields = eip2612PermitModelFields
    } = data
    const domain: EIP712Object = { name: tokenName, verifyingContract };

    if (isSaltInsteadOfChainId) domain.salt = getSalt(data)
    if (!isSaltInsteadOfChainId) domain.chainId = chainId
    if (!isDomainWithoutVersion) domain.version = version

    return {
        types: {
            EIP712Domain: [
                {name: 'name', type: 'string'},
                isDomainWithoutVersion ? null : {name: 'version', type: 'string'},
                isSaltInsteadOfChainId ? null : {name: 'chainId', type: 'uint256'},
                {name: 'verifyingContract', type: 'address'},
                !isSaltInsteadOfChainId ? null : {name: 'salt', type: 'bytes32'},
            ].filter(inputIsNotNullOrUndefined),
            Permit: permitModelFields,
        },
        primaryType: 'Permit',
        domain, message: params,
    };
}

export function buildPermit2TypedData(
    { domain, types, values }: ReturnType<typeof AllowanceTransfer.getPermitData>,
): Eip712Permit2 {
    return {
        primaryType: 'PermitSingle',
        types: types,
        domain: domain,
        message: values,
    } as Eip712Permit2;
}

export function fromRpcSig(sig: string): {v: number; r: Buffer; s: Buffer} {
    const signature = Buffer.from(
        sig.startsWith('0x')
            ? sig.slice(2)
            : sig,
        'hex'
    );

    // NOTE: with potential introduction of chainId this might need to be updated
    if (signature.length !== 65) {
        throw new Error('Invalid signature length');
    }

    // support both versions of `eth_sign` responses
    const v = signature[64] < 27
        ? signature[64] + 27
        : signature[64];

    return {
        v: v,
        r: signature.slice(0, 32),
        s: signature.slice(32, 64),
    };
}

export function getPermitContractCallParams(
    permitParams: PermitParams,
    permitSignature: string
): (string | number | Buffer)[] {
    const {v, r, s} = fromRpcSig(permitSignature);

    return [
        permitParams.owner,
        permitParams.spender,
        permitParams.value,
        permitParams.deadline,
        v,
        r,
        s,
    ];
}

export function getDaiPermitContractCallParams(
    permitParams: DaiPermitParams,
    permitSignature: string
): (string | number | boolean | Buffer)[] {
    const {v, r, s} = fromRpcSig(permitSignature);

    return [
        permitParams.holder,
        permitParams.spender,
        permitParams.nonce,
        permitParams.expiry,
        true,
        v,
        r,
        s,
    ];
}

export function buildTokenIdentifier(tokenAddress: string, chainId: number): string {
    return `${tokenAddress}:${chainId}`.toLowerCase();
}

function getSalt(data: PermitTypedDataParamsModel): string {
    const web3 = new Web3();
    const { chainId, tokenAddress } = data;
    const identifier = buildTokenIdentifier(tokenAddress, chainId);
    if (TOKEN_ADDRESSES_WITH_SALT.includes(identifier)) {
        return web3.eth.abi.encodeParameter('uint256', `${chainId}`)
    }
    console.warn(
        `mapper for token ${tokenAddress} from network chainId: ${chainId} not exist`
    )
    return web3.eth.abi.encodeParameter('uint256', '0');
}
