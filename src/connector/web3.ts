export type TransactionConfig = {
    data?: string
    to?: string
}

export interface Web3Like {
    eth: {
        call(transactionConfig: TransactionConfig): Promise<string>
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extend(extension: unknown): any
}
