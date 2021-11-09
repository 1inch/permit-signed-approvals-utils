export interface PermitRecoveryParams {
    chainId: number;
    tokenName: string;
    tokenAddress: string;
    callData: string;
    version?: string;
}

export interface SyncPermitRecoveryParams extends PermitRecoveryParams {
    nonce: number;
    isDomainWithoutVersion?: boolean;
}
