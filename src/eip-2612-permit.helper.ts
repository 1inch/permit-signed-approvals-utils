import { eip2612PermitModelFields } from './eip-2612-permit.const';
import { EIP712TypedData } from './model/eip712.model';
import { DaiPermitParams, PermitParams } from './model/permit.model';
import {PermitTypedDataParamsModel} from './model/permit-typed-data-params.model';

export function inputIsNotNullOrUndefined<T>(
    input: null | undefined | T
): input is T {
    return input !== null && input !== undefined;
}

// eslint-disable-next-line max-lines-per-function
export function buildPermitTypedData({
    chainId,
    tokenName,
    tokenAddress,
    params,
    isDomainWithoutVersion = false,
    version = '1',
    permitModelFields = eip2612PermitModelFields
}: PermitTypedDataParamsModel): EIP712TypedData {
    const domainCommon = {
        name: tokenName,
        chainId,
        verifyingContract: tokenAddress
    };

    return {
        types: {
            EIP712Domain: [
                {name: 'name', type: 'string'},
                ...[
                    isDomainWithoutVersion
                        ? null
                        : {name: 'version', type: 'string'},
                ],
                {name: 'chainId', type: 'uint256'},
                {name: 'verifyingContract', type: 'address'},
            ].filter(inputIsNotNullOrUndefined),
            Permit: permitModelFields,
        },
        primaryType: 'Permit',
        domain: isDomainWithoutVersion
            ? domainCommon
            : { ...domainCommon, version },
        message: params,
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
