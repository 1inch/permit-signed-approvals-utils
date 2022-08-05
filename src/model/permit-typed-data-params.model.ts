import {ChainId} from './chain.model';
import {EIP712Object, EIP712Parameter} from './eip712.model';

export interface PermitTypedDataParamsModel {
    chainId: ChainId;
    tokenName: string;
    tokenAddress: string;
    params: EIP712Object;
    isDomainWithoutVersion?: boolean;
    isSaltInsteadOfChainId?: boolean;
    version?: string;
    permitModelFields?: EIP712Parameter[];
}
