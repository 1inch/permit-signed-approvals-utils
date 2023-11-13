import { AllowanceTransfer, PERMIT2_ADDRESS } from "@uniswap/permit2-sdk";
import { SignTypedDataVersion, TypedDataUtils } from "@metamask/eth-sig-util";
import { ProviderConnector } from "./connector/provider.connector";
import { buildPermit2TypedData } from "./eip-2612-permit.helper";
import { getPermit2Contract } from "./helpers/get-permit2-contract";
import { splitSignature } from "ethers/lib/utils";
import { compressPermit, decompressPermit, trim0x } from "@1inch/solidity-utils";

export function cutSelector(data: string): string {
    const hexPrefix = '0x'
    return hexPrefix + data.substr(hexPrefix.length + 8)
}

export const MAX_UINT48 = 2n ** 48n - 1n;
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

export class Permit2Builder {
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
        expiry = MAX_UINT48,
        sigDeadline = MAX_UINT48,
        compact = false
    }: Permit2Params) {
        const details = {
            token: tokenAddress,
            amount: value,
            expiration: expiry,
            nonce
        };

        const permitSingle = {
            details,
            spender,
            sigDeadline
        };

        const permitData = AllowanceTransfer.getPermitData(
            permitSingle,
            PERMIT2_ADDRESS,
            chainId
        );

        const dataHash = TypedDataUtils.hashStruct(
            'PermitSingle',
            permitData.values as unknown as any,
            permitData.types,
            SignTypedDataVersion.V4
        ).toString('hex');

        const typedData = buildPermit2TypedData(permitData);

        const signedPermit = await this.connector.signTypedData(walletAddress, typedData, dataHash);

        const signature = splitSignature(signedPermit);

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
