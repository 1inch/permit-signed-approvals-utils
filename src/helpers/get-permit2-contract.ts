import { PERMIT2_ADDRESS } from "@uniswap/permit2-sdk";
import { Contract } from "ethers";
import Permit2ABI from '../abi/Permit2.abi.json'

export function getPermit2Contract(): Contract {
    return new Contract(PERMIT2_ADDRESS, Permit2ABI)
}
