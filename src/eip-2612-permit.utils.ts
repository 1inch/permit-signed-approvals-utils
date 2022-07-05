import {
    TypedDataUtils,
    recoverTypedSignature,
    TypedMessage,
    SignTypedDataVersion
} from '@metamask/eth-sig-util';
import {ProviderConnector} from './connector/provider.connector';
import {
    DAI_EIP_2612_PERMIT_ABI, DAI_EIP_2612_PERMIT_INPUTS, DAI_PERMIT_SELECTOR,
    daiPermitModelFields,
    DOMAIN_SEPARATOR_ABI,
    DOMAIN_TYPEHASH_ABI,
    DOMAINS_WITHOUT_VERSION,
    EIP_2612_PERMIT_ABI, EIP_2612_PERMIT_INPUTS,
    EIP_2612_PERMIT_SELECTOR,
    ERC_20_NONCES_ABI, PERMIT_TYPEHASH_ABI,
} from './eip-2612-permit.const';
import {
    buildPermitTypedData, getDaiPermitContractCallParams,
    getPermitContractCallParams,
} from './eip-2612-permit.helper';
import {ChainId} from './model/chain.model';
import {DaiPermitParams, PermitParams} from './model/permit.model';
import {MessageTypes} from './model/eip712.model';
import {PermitRecoveryParams, SyncPermitRecoveryParams} from './model/permit-recovery.model';

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
            SignTypedDataVersion.V4
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
            SignTypedDataVersion.V4
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

    async recoverPermitOwnerFromCallData(params: PermitRecoveryParams): Promise<string> {
        const { owner } = this.connector.decodeABIParameters(
            EIP_2612_PERMIT_INPUTS,
            params.callData
        );

        return this.syncRecoverPermitOwnerFromCallData({
            ...params,
            nonce: await this.getTokenNonce(params.tokenAddress, owner),
            isDomainWithoutVersion: await this.isDomainWithoutVersion(params.tokenAddress),
        });
    }

    syncRecoverPermitOwnerFromCallData(params: SyncPermitRecoveryParams): string {
        const {
            callData, chainId, tokenAddress, tokenName, nonce,
            isDomainWithoutVersion = false, version = undefined
        } = params;
        const {
            owner, spender, value, deadline, v, r, s
        } = this.connector.decodeABIParameters(EIP_2612_PERMIT_INPUTS, callData);

        const permitParams: PermitParams = { owner, spender, value, deadline, nonce };
        const permitData = buildPermitTypedData({
            chainId,
            tokenName,
            tokenAddress,
            params: permitParams,
            isDomainWithoutVersion,
            version
        });

        return recoverTypedSignature({
            data: permitData as TypedMessage<MessageTypes>,
            signature: '0x' + r.slice(2) + s.slice(2) + (+v).toString(16),
            version: SignTypedDataVersion.V4
        });
    }

    async recoverDaiLikePermitOwnerFromCallData(params: PermitRecoveryParams): Promise<string> {
        const { holder } = this.connector.decodeABIParameters(
            DAI_EIP_2612_PERMIT_INPUTS,
            params.callData
        );

        return this.syncRecoverDaiLikePermitOwnerFromCallData({
            ...params,
            nonce: await this.getTokenNonce(params.tokenAddress, holder),
            isDomainWithoutVersion: await this.isDomainWithoutVersion(params.tokenAddress),
        });
    }

    syncRecoverDaiLikePermitOwnerFromCallData(params: SyncPermitRecoveryParams): string {
        const {
            callData, chainId, tokenAddress, tokenName, nonce,
            isDomainWithoutVersion = false, version = undefined
        } = params;
        const {
            holder, spender, value, expiry, allowed, v, r, s
        } = this.connector.decodeABIParameters(DAI_EIP_2612_PERMIT_INPUTS, callData);

        const permitParams: DaiPermitParams = { holder, spender, value, expiry, nonce, allowed };
        const permitData = buildPermitTypedData({
            chainId,
            tokenName,
            tokenAddress,
            params: permitParams,
            isDomainWithoutVersion,
            version,
            permitModelFields: daiPermitModelFields
        });

        return recoverTypedSignature({
            data: permitData as TypedMessage<MessageTypes>,
            signature: '0x' + r.slice(2) + s.slice(2) + (+v).toString(16),
            version: SignTypedDataVersion.V4,
        });
    }

    getTokenNonce(
        tokenAddress: string,
        walletAddress: string
    ): Promise<number> {
        return this.getTokenNonceByMethod('nonces', tokenAddress, walletAddress).catch(() => {
            /**
             * Fallback to _nonces for tokens like:
             * https://polygonscan.com/address/0x3cb4ca3c9dc0e02d252098eebb3871ac7a43c54d
             */
            return this.getTokenNonceByMethod('_nonces', tokenAddress, walletAddress);
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

    private getTokenNonceByMethod(
        methodName: 'nonces' | '_nonces',
        tokenAddress: string,
        walletAddress: string
    ): Promise<number> {
        const callData = this.connector.contractEncodeABI(
            ERC_20_NONCES_ABI,
            tokenAddress,
            methodName,
            [walletAddress]
        );

        return this.connector.ethCall(tokenAddress, callData).then((res) => {
            if (res === '0x' || Number.isNaN(Number(res))) {
                return Promise.reject(new Error('nonce is NaN'));
            }

            return Number(res);
        });
    }
}
