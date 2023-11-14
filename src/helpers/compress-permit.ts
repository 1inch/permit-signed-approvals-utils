import { defaultAbiCoder } from "ethers/lib/utils";
import { MAX_UINT48 } from "./constants";
import { BigNumber } from "ethers";
import { trim0x } from "./trim-0x";

export function compressPermit(permit: string): string {
    switch (permit.length) {
        case 706: {
            const decodedResult = decodePermit(permit);
            return packPermitArgs(decodedResult);
        }
        case 202:
        case 146:
        case 194:
            throw new Error('Permit is already compressed')
        default:
            throw new Error('Invalid permit length')
    }
}

function decodePermit(permit: string): ReturnType<typeof defaultAbiCoder.decode> {
    // IPermit2.permit(
    // address owner, PermitSingle calldata permitSingle, bytes calldata signature
    // )
    return defaultAbiCoder.decode(
        [
            'address owner',
            'address token',
            'uint160 amount',
            'uint48 expiration',
            'uint48 nonce',
            'address spender',
            'uint256 sigDeadline',
            'bytes signature'
        ],
        permit
    );
}

function packPermitArgs(args: ReturnType<typeof defaultAbiCoder.decode>):string {
    // CompactIPermit2.permit(
    // uint160 amount, uint32 expiration, uint32 nonce,
    // uint32 sigDeadline, uint256 r, uint256 vs
    // )
    const amount = bigNumberToHexWithout0x(args.amount)
    const expiration = BigInt(args.expiration);
    return (
        '0x' +
        amount.padStart(40, '0') +
        (args.expiration.toString() === MAX_UINT48.toString()
            ? '00000000'
            : (expiration + BigInt(1)).toString(16).padStart(8, '0')) +
        args.nonce.toString(16).padStart(8, '0') +
        (args.sigDeadline.toString() === MAX_UINT48.toString()
            ? '00000000'
            : (args.sigDeadline.toBigInt() + BigInt(1)).toString(16).padStart(8, '0')) +
        trim0x(args.signature).padStart(128, '0')
    );
}

function bigNumberToHexWithout0x(value: BigNumber): string {
    return trim0x(value.toHexString());
}
