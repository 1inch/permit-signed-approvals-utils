
import { AbiCoder, Signature } from "ethers";
import {PermitDetails, PermitSingle} from '../../model/eip712-permit2.model';

type DecodeResult = ReturnType<InstanceType<typeof AbiCoder>['decode']>;

export enum DecompressedPermit {
    owner,
    token,
    amount,
    expiration,
    nonce,
    spender,
    sigDeadline,
    signature
}

export interface DecodedUncompressedPermitSingle {
    signature: Signature,
    permitSingle: PermitSingle;
}

export function decodeUncompressedPermitSingle(
    decompressedPermit: string
): DecodedUncompressedPermitSingle {
    const result = decodePermit(decompressedPermit);

    const details: PermitDetails = {
        token: result[DecompressedPermit.token],
        amount: result[DecompressedPermit.amount],
        expiration: BigInt((result[DecompressedPermit.expiration] as number)),
        nonce: BigInt(result[DecompressedPermit.nonce] as number)
    };

    const permitSingle: PermitSingle = {
        details,
        spender: result[DecompressedPermit.spender],
        sigDeadline: result[DecompressedPermit.sigDeadline]
    };

    const signature = Signature.from(
        result[DecompressedPermit.signature] as string
    );

    return {
        signature,
        permitSingle
    }
}

function decodePermit(decompressedPermit: string): DecodeResult {
    const abiCoder = new AbiCoder();
    return abiCoder.decode([
        'address',
        'address',
        'uint160',
        'uint48',
        'uint48',
        'address',
        'uint256',
        'bytes'
    ], decompressedPermit);
}
