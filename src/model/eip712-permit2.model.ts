import { EIP712TypedData } from "./eip712.model";
import {TypedDataDomain} from 'ethers';

type BigNumberish = bigint | string | number

export type PermitSingleData = {
    domain: TypedDataDomain;
    types: Record<string, TypedDataField[]>;
    values: PermitSingle;
};

export interface PermitDetails {
    token: string;
    amount: BigNumberish;
    expiration: BigNumberish
    nonce: BigNumberish
}

export interface PermitSingle {
    details: PermitDetails;
    spender: string;
    sigDeadline: BigNumberish;
}

export interface TypedDataField {
    name: string;
    type: string;
}

export type Eip712Permit2 = {
    types: Record<string, TypedDataField[]>;
    domain: TypedDataDomain;
    message: PermitSingle;
    primaryType: string;
} & EIP712TypedData;
