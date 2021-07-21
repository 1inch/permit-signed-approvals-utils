import {EIP712Object} from './eip712.model';

export interface PermitParams extends EIP712Object {
    owner: string;
    spender: string;
    value: string;
    nonce: number;
    deadline: number;
}
