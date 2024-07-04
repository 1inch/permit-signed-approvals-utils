import {ProviderConnector} from './provider.connector';
import {EIP712TypedData} from '../model/eip712.model';
import {AbiInput, AbiItem} from '../model/abi.model';
import {Interface, ParamType, Wallet, InterfaceAbi} from 'ethers'
import {add0x} from '../helpers/add-0x';
import {TypedDataDomain} from 'ethers/src.ts/hash';
import {abiCoder} from './abi-coder';
import {Web3Like} from './web3';

export class PrivateKeyProviderConnector implements ProviderConnector {

    private readonly wallet: Wallet

    constructor(
        readonly privateKey: string,
        protected readonly web3Provider: Web3Like
    ) {
        this.wallet = new Wallet(add0x(privateKey))
    }

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
        _walletAddress: string,
        typedData: EIP712TypedData,
        _typedDataHash = ''
    ): Promise<string> {
        const result = this.wallet.signTypedData(
            typedData.domain as TypedDataDomain,
            typedData.types,
            typedData.message
        )

        return Promise.resolve(result);
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
