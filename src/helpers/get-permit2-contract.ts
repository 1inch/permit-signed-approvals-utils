import { Contract } from "ethers";
import Permit2ABI from '../abi/Permit2.abi.json'
import {Permit2Address} from '../permit2.utils';

export function getPermit2Contract(): Contract {
    return new Contract(Permit2Address, Permit2ABI)
}
