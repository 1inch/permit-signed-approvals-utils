import {EIP712TypedData} from './model/eip712.model';
import {ChainId} from './model/chain.model';
import {PermitParams} from './model/permit.model';

export function inputIsNotNullOrUndefined<T>(
    input: null | undefined | T
): input is T {
    return input !== null && input !== undefined;
}

// eslint-disable-next-line max-lines-per-function
export function buildPermitTypedData(
    chainId: ChainId,
    tokenName: string,
    tokenAddress: string,
    params: PermitParams,
    isDomainWithoutVersion = false,
    version = '1'
): EIP712TypedData {
    const domainCommon = {name: tokenName, chainId, verifyingContract: tokenAddress}

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
            Permit: [
                {name: 'owner', type: 'address'},
                {name: 'spender', type: 'address'},
                {name: 'value', type: 'uint256'},
                {name: 'nonce', type: 'uint256'},
                {name: 'deadline', type: 'uint256'},
            ],
        },
        primaryType: 'Permit',
        domain: isDomainWithoutVersion ? domainCommon : {...domainCommon, version},
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
