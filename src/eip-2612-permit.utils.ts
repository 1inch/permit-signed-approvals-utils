import {TypedDataUtils} from 'eth-sig-util';
import {ProviderConnector} from './connector/provider.connector';
import {
    DAI_EIP_2612_PERMIT_ABI, DAI_PERMIT_SELECTOR,
    daiPermitModelFields,
    DOMAIN_SEPARATOR_ABI,
    DOMAIN_TYPEHASH_ABI,
    DOMAINS_WITHOUT_VERSION,
    EIP_2612_PERMIT_ABI,
    EIP_2612_PERMIT_SELECTOR,
    ERC_20_NONCES_ABI, PERMIT_TYPEHASH_ABI,
} from './eip-2612-permit.const';
import {
    buildPermitTypedData, getDaiPermitContractCallParams,
    getPermitContractCallParams,
} from './eip-2612-permit.helper';
import {ChainId} from './model/chain.model';
import {DaiPermitParams, PermitParams} from './model/permit.model';

export class Eip2612PermitUtils {
    constructor(protected connector: ProviderConnector) {}

    async buildPermitSignature(
        permitParams: PermitParams,
        chainId: ChainId,
        tokenName: string,
        tokenAddress: string,
        version?: string
    ): Promise<string> {
        const permitData = buildPermitTypedData({
            chainId,
            tokenName,
            tokenAddress,
            params: permitParams,
            isDomainWithoutVersion: await this.isDomainWithoutVersion(tokenAddress),
            version
        });
        const dataHash = TypedDataUtils.hashStruct(
            permitData.primaryType,
            permitData.message,
            permitData.types,
            true
        ).toString('hex');

        return this.connector.signTypedData(permitParams.owner, permitData, dataHash);
    }

    async buildPermitCallData(
        permitParams: PermitParams,
        chainId: ChainId,
        tokenName: string,
        tokenAddress: string,
        version?: string
    ): Promise<string> {
        const permitSignature = await this.buildPermitSignature(
            permitParams,
            chainId,
            tokenName,
            tokenAddress,
            version
        );
        const permitCallData = this.connector.contractEncodeABI(
            EIP_2612_PERMIT_ABI,
            tokenAddress,
            'permit',
            getPermitContractCallParams(permitParams, permitSignature)
        );

        return permitCallData.replace(EIP_2612_PERMIT_SELECTOR, '0x');
    }

    async buildDaiLikePermitSignature(
        params: DaiPermitParams,
        chainId: ChainId,
        tokenName: string,
        tokenAddress: string,
        version?: string
    ): Promise<string> {
        const permitData = buildPermitTypedData({
            chainId, tokenName, tokenAddress, params,
            isDomainWithoutVersion: await this.isDomainWithoutVersion(tokenAddress),
            version,
            permitModelFields: daiPermitModelFields
        });
        const dataHash = TypedDataUtils.hashStruct(
            permitData.primaryType,
            permitData.message,
            permitData.types,
            true
        ).toString('hex');

        return this.connector.signTypedData(params.holder, permitData, dataHash);
    }

    async buildDaiLikePermitCallData(
        permitParams: DaiPermitParams,
        chainId: ChainId,
        tokenName: string,
        tokenAddress: string,
        version?: string
    ): Promise<string> {
        const permitSignature = await this.buildDaiLikePermitSignature(
            permitParams,
            chainId,
            tokenName,
            tokenAddress,
            version
        );
        const permitCallData = this.connector.contractEncodeABI(
            DAI_EIP_2612_PERMIT_ABI,
            tokenAddress,
            'permit',
            getDaiPermitContractCallParams(permitParams, permitSignature)
        );

        return permitCallData.replace(DAI_PERMIT_SELECTOR, '0x');
    }

    getTokenNonce(
        tokenAddress: string,
        walletAddress: string
    ): Promise<number> {
        const callData = this.connector.contractEncodeABI(
            ERC_20_NONCES_ABI,
            tokenAddress,
            'nonces',
            [walletAddress]
        );

        return this.connector.ethCall(tokenAddress, callData).then((res) => {
            return Number(res);
        });
    }

    async getDomainTypeHash(tokenAddress: string): Promise<string | null> {
        try {
            return await this.connector.ethCall(
                tokenAddress,
                this.connector.contractEncodeABI(
                    DOMAIN_TYPEHASH_ABI,
                    tokenAddress,
                    'DOMAIN_TYPEHASH',
                    []
                )
            );
        } catch (e) {
            return Promise.resolve(null);
        }
    }

    async getPermitTypeHash(tokenAddress: string): Promise<string | null> {
        try {
            return await this.connector.ethCall(
                tokenAddress,
                this.connector.contractEncodeABI(
                    PERMIT_TYPEHASH_ABI,
                    tokenAddress,
                    'PERMIT_TYPEHASH',
                    []
                )
            );
        } catch (e) {
            return Promise.resolve(null);
        }
    }

    async getDomainSeparator(tokenAddress: string): Promise<string> {
        return await this.connector.ethCall(
            tokenAddress,
            this.connector.contractEncodeABI(
                DOMAIN_SEPARATOR_ABI,
                tokenAddress,
                'DOMAIN_SEPARATOR',
                []
            )
        );
    }

    async isDomainWithoutVersion(tokenAddress: string): Promise<boolean> {
        const domainTypeHash = await this.getDomainTypeHash(tokenAddress);

        return !!domainTypeHash && DOMAINS_WITHOUT_VERSION.includes(domainTypeHash.toLowerCase());
    }
}
