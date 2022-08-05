import Web3 from 'web3';
import { eip2612PermitModelFields } from './eip-2612-permit.const';
import { EIP712Object, EIP712TypedData } from './model/eip712.model';
import { DaiPermitParams, PermitParams } from './model/permit.model';
import {PermitTypedDataParamsModel} from './model/permit-typed-data-params.model';

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

// eslint-disable-next-line max-lines-per-function
function getSalt(data: PermitTypedDataParamsModel): string {
    const web3 = new Web3();
    const { chainId, tokenAddress } = data;
    switch (`${tokenAddress}:${chainId}`) {
        case '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174:137': // USDC Proxy Polygon
        case '0xc2132D05D31c914a87C6611C10748AEb04B58e8F:137': // USDT Proxy Polygon
        case '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063:137': // DAI Proxy Polygon
        case '0xdAb529f40E671A1D4bF91361c21bf9f0C9712ab7:137': // BUSD Proxy Polygon
        case '0x2e1AD108fF1D8C782fcBbB89AAd783aC49586756:137': // TUSD Proxy Polygon
        case '0x8505b9d2254A7Ae468c0E9dd10Ccea3A837aef5c:137': // COMP Proxy Polygon
        case '0xb33EaAd8d922B1083446DC23f610c2567fB5180f:137': // UNI Proxy Polygon
        case '0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a:137': // SUSHI Proxy Polygon
        case '0x50B728D8D964fd00C2d0AAD81718b71311feF68a:137': // SNX Proxy Polygon
        case '0xD6DF932A45C0f255f85145f286eA0b292B21C90B:137': // AAVE Proxy Polygon
        case '0x172370d5Cd63279eFa6d502DAB29171933a610AF:137': // CRV Proxy Polygon
        case '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6:137': // WBTC Proxy Polygon
        case '0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7:137': // GHST Proxy Polygon
        case '0x361A5a4993493cE00f61C32d4EcCA5512b82CE90:137': // SDT Proxy Polygon
            return web3.eth.abi.encodeParameter('uint256', `${chainId}`)
        default: {
            console.warn(
                `mapper for token ${tokenAddress} from network chainId: ${chainId} not exist`
            )
            return web3.eth.abi.encodeParameter('uint256', '0');
        }
    }
}
