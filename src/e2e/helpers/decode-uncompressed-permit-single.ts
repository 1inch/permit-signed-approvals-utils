import { defaultAbiCoder, splitSignature } from "ethers/lib/utils";
import { PermitDetails, PermitSingle } from "@uniswap/permit2-sdk";
import { BigNumber } from "ethers";

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

export function decodeUncompressedPermitSingle(decompressedPermit: string) {
    const result = decodePermit(decompressedPermit);

    const details: PermitDetails = {
        token: result[DecompressedPermit.token],
        amount: (result[DecompressedPermit.amount] as BigNumber).toBigInt(),
        expiration: BigInt((result[DecompressedPermit.expiration] as number)),
        nonce: BigInt(result[DecompressedPermit.nonce] as number)
    };

    const permitSingle: PermitSingle = {
        details,
        spender: result[DecompressedPermit.spender],
        sigDeadline: (result[DecompressedPermit.sigDeadline]).toBigInt()
    };

    const signature = splitSignature(
        result[DecompressedPermit.signature] as string
    );

    return {
        signature,
        permitSingle
    }
}

function decodePermit(decompressedPermit: string): ReturnType<typeof defaultAbiCoder.decode> {
    return defaultAbiCoder.decode([
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
