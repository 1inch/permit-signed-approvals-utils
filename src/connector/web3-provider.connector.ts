import {ProviderConnector} from './provider.connector';
import {EIP712TypedData} from '../model/eip712.model';
import {AbiInput, AbiItem} from '../model/abi.model';
import {Web3Like} from './web3';
import {Interface, ParamType, InterfaceAbi} from 'ethers';
import {abiCoder} from './abi-coder';

interface ExtendedWeb3 extends Web3Like {
    signTypedDataV4(walletAddress: string, typedData: string): Promise<string>;
}

export class Web3ProviderConnector implements ProviderConnector {
    constructor(protected readonly web3Provider: Web3Like) {}

    contractEncodeABI(
        abi: AbiItem[],
        _address: string | null,
        methodName: string,
        methodParams: unknown[]
    ): string {
        const contract = new Interface(abi as InterfaceAbi)
        return contract.encodeFunctionData(methodName, methodParams).toString()
    }

    signTypedData(
        walletAddress: string,
        typedData: EIP712TypedData,
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        _typedDataHash: string
    ): Promise<string> {
        const extendedWeb3: ExtendedWeb3 = this.web3Provider.extend({
            methods: [{
                name: 'signTypedDataV4',
                call: 'eth_signTypedData_v4',
                params: 2
            }]
        });

        return extendedWeb3.signTypedDataV4(walletAddress, JSON.stringify(typedData));
    }

    ethCall(contractAddress: string, callData: string): Promise<string> {
        return this.web3Provider.eth.call({
            to: contractAddress,
            data: callData,
        });
    }

    decodeABIParameter<T>(type: string, hex: string): T {
        return abiCoder.decode([type], hex)[0] as T;
    }

    decodeABIParameters<T>(types: AbiInput[], hex: string): T {
        const formattedTypes: ReadonlyArray<ParamType> = types.map((type) => ParamType.from(type))
        return abiCoder.decode(formattedTypes, hex) as T;
    }
}
