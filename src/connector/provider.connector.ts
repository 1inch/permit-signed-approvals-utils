import {EIP712TypedData} from '../model/eip712.model';
import {AbiInput, AbiItem} from '../model/abi.model';

export interface ProviderConnector {
    contractEncodeABI(
        abi: AbiItem[],
        address: string | null,
        methodName: string,
        methodParams: unknown[]
    ): string;

    signTypedData(
        walletAddress: string,
        typedData: EIP712TypedData,
        typedDataHash: string
    ): Promise<string>;

    ethCall(contractAddress: string, callData: string): Promise<string>;

    decodeABIParameter<T>(type: string, hex: string): T;

    decodeABIParameters<T>(types: AbiInput[], hex: string): T;
}
