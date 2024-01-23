import {EIP712Object} from './eip712.model';

export interface DecodedPermitParams {
    owner: string;
    spender: string;
    value: string;
    nonce: number;
    deadline: number;
    v: string;
    r: string;
    s: string;
}

export interface PermitParams extends EIP712Object {
    owner: string;
    spender: string;
    value: string;
    nonce: number;
    deadline: number;
}

export interface DaiDecodedPermitParams {
    holder: string;
    spender: string;
    nonce: number;
    expiry: number;
    allowed: boolean;
    value: string;
    v: string;
    r: string;
    s: string;
}

export interface DaiPermitParams extends EIP712Object {
    holder: string;
    spender: string;
    nonce: number;
    expiry: number;
    allowed: boolean;
}
