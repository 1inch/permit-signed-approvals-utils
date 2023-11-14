import { ProviderConnector } from "../../connector/provider.connector";
import { EIP712TypedData } from "../../model/eip712.model";
import { AbiItem } from "web3-utils";
import { utils } from 'ethers'
import { ethers } from "hardhat";

export type Signer = Awaited<ReturnType<typeof ethers.getSigners>>[0];

// eslint-disable-next-line max-lines-per-function
export function getProviderConnector(signer: Signer): ProviderConnector {
    return {
        signTypedData(
            _: string,
            typedData: EIP712TypedData,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            _typedDataHash: string
        ): Promise<string> {
            return signer._signTypedData(typedData.domain, typedData.types, typedData.message);
        },
        contractEncodeABI(
            abi: AbiItem[],
            _: string | null,
            methodName: string,
            methodParams: unknown[]
        ): string {
            // todo any
            const iface = new utils.Interface(abi as any);
            return iface.encodeFunctionData(methodName, methodParams);
        },
        ethCall(contractAddress: string, callData: string): Promise<string> {
            const provider = ethers.provider;
            return provider.call({
                to: contractAddress,
                data: callData,
            });
        }
    } as ProviderConnector;
}
