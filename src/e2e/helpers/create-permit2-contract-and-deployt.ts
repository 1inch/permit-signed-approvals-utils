import { PERMIT2_ADDRESS } from "@uniswap/permit2-sdk";
import byteCode from '../contracts/permit2.json'
import PERMIT2_ABI from '../../abi/Permit2.abi.json';
import { ethers } from "hardhat";
import { Contract } from "ethers";

export async function createPermit2ContractAndDeploy(): Promise<Contract> {
    if ((await ethers.provider.getCode(PERMIT2_ADDRESS)) === '0x') {
        await ethers.provider.send('hardhat_setCode', [PERMIT2_ADDRESS, byteCode.bytecode]);
    }
    return ethers.getContractAt(PERMIT2_ABI, PERMIT2_ADDRESS);
}
