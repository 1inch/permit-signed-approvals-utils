import { MAX_UINT48 } from "./constants";
import { trim0x } from "./trim-0x";
import { AbiCoder } from 'ethers';

interface PermitArgs {
    amount: bigint;
    expiration: bigint;
    nonce: bigint;
    sigDeadline: bigint;
    r: string;
    vs: string;
}

const ENCODED_PERMIT_ARGS: ReadonlyArray<string> = [
    'address owner',
    'address token',
    'uint160 amount',
    'uint48 expiration',
    'uint48 nonce',
    'address spender',
    'uint256 sigDeadline',
    'bytes signature'
];

export function decompressPermit(
    permit: string,
    token: string,
    owner: string,
    spender: string
): string {
    switch (permit.length) {
        case 194: {
            const args = parsePermit(permit)
            // IPermit2.permit(
            // address owner, PermitSingle calldata permitSingle, bytes calldata signature
            // )
            return encodePermitArgs(owner, token, spender, args);
        }
        case 450:
        case 514:
        case 706:
            throw new Error('Permit is already decompressed')
        default:
            throw new Error('Invalid permit length')
    }
}

function encodePermitArgs(
    owner: string, token: string, spender: string, permitArgs: PermitArgs
): string {
    const abiCoder = new AbiCoder();
    return abiCoder.encode(
        ENCODED_PERMIT_ARGS,
        [
            owner,
            token,
            permitArgs.amount,
            permitArgs.expiration === BigInt(0) ? MAX_UINT48 : permitArgs.expiration - BigInt(1),
            permitArgs.nonce,
            spender,
            permitArgs.sigDeadline === BigInt(0)
                ? MAX_UINT48
                : permitArgs.sigDeadline - BigInt(1),
            permitArgs.r + trim0x(permitArgs.vs)
        ]
    )
}

function parsePermit(permit: string): PermitArgs {
    // Compact IPermit2.permit(
    // uint160 amount, uint32 expiration, uint32 nonce, uint32 sigDeadline, uint256 r, uint256 vs
    // )
    return {
        amount: BigInt(permit.slice(0, 42)),
        expiration: BigInt('0x' + permit.slice(42, 50)),
        nonce: BigInt('0x' + permit.slice(50, 58)),
        sigDeadline: BigInt('0x' + permit.slice(58, 66)),
        r: '0x' + permit.slice(66, 130),
        vs: '0x' + permit.slice(130, 194)
    };
}
