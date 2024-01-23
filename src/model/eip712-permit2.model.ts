import { EIP712TypedData } from "./eip712.model";
import { TypedDataDomain, TypedDataField } from "@ethersproject/abstract-signer";
import { PermitBatchData, PermitSingle } from "@uniswap/permit2-sdk/dist/allowanceTransfer";

export type Eip712Permit2 = {
    types: Record<string, TypedDataField[]>;
    domain: TypedDataDomain;
    message: PermitSingle | PermitBatchData;
    primaryType: string;
} & EIP712TypedData;
