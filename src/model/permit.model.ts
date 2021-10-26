import {EIP712Object} from './eip712.model';

export interface PermitParams extends EIP712Object {
    owner: string;
    spender: string;
    value: string;
    nonce: number;
    deadline: number;
}

export interface DaiPermitParams extends EIP712Object {
    holder: string;
    spender: string;
    nonce: number;
    expiry: number;
    allowed: boolean;
}
