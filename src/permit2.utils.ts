import { ProviderConnector } from "./connector/provider.connector";
import { buildPermit2TypedData } from "./eip-2612-permit.helper";
import { getPermit2Contract } from "./helpers/get-permit2-contract";
import { compressPermit } from "./helpers/compress-permit";
import { decompressPermit } from "./helpers/decompress-permit";
import { MAX_UINT48 } from "./helpers/constants";
import { trim0x } from "./helpers/trim-0x";
import { ethers, Signature } from 'ethers';
import {
    PermitDetails,
    PermitSingle,
    PermitSingleData,
    TypedDataField
} from './model/eip712-permit2.model';

function cutSelector(data: string): string {
    const hexPrefix = '0x'
    return hexPrefix + data.substr(hexPrefix.length + 8)
}

export interface Permit2Params {
    walletAddress: string;
    spender: string;
    value: string | bigint;
    tokenAddress: string;
    nonce: bigint;
    chainId: number;
    expiry?: bigint;
    sigDeadline?: bigint;
    compact?: boolean;
}

export const Permit2Address = '0x000000000022D473030F116dDEE9F6B43aC78BA3'

const PERMIT_TYPES: Record<string, TypedDataField[]> = {
    PermitSingle: [
        { name: 'details', type: 'PermitDetails' },
        { name: 'spender', type: 'address' },
        { name: 'sigDeadline', type: 'uint256' },
    ],
    PermitDetails: [
        { name: 'token', type: 'address' },
        { name: 'amount', type: 'uint160' },
        { name: 'expiration', type: 'uint48' },
        { name: 'nonce', type: 'uint48' },
    ],
}

export class Permit2Utils {
    constructor(
        private connector: ProviderConnector,
    ) {
    }

    // eslint-disable-next-line max-lines-per-function
    async buildPermit2({
        walletAddress,
        spender,
        value,
        tokenAddress,
        nonce,
        chainId,
        expiry,
        sigDeadline,
        compact = false
    }: Permit2Params): Promise<string> {
        const details: PermitDetails = {
            token: tokenAddress,
            amount: value,
            expiration: expiry || MAX_UINT48,
            nonce
        };

        const permitSingle: PermitSingle = {
            details,
            spender,
            sigDeadline: sigDeadline || MAX_UINT48
        }

        const dataHash = ethers.TypedDataEncoder.hashStruct(
            'PermitSingle',
            PERMIT_TYPES,
            permitSingle
        )

        const data: PermitSingleData = {
            types: PERMIT_TYPES,
            values: permitSingle,
            domain: {
                name: 'Permit2',
                chainId,
                verifyingContract: Permit2Address,
            }
        }

        const typedData = buildPermit2TypedData(data);

        const signedPermit = await this.connector.signTypedData(walletAddress, typedData, dataHash);

        const signature = Signature.from(signedPermit);

        const permit2Contract = getPermit2Contract();
        const permitCall = cutSelector(
            permit2Contract.interface.encodeFunctionData('permit', [
                walletAddress,
                permitSingle,
                signature.r + trim0x(signature.yParityAndS)
            ])
        );

        return compact
            ? compressPermit(permitCall)
            : decompressPermit(
                compressPermit(permitCall),
                tokenAddress,
                walletAddress,
                spender
            )
    }
}
