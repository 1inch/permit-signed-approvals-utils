import byteCode from '../contracts/permit2.json'
import PERMIT2_ABI from '../../abi/Permit2.abi.json';
import { ethers } from "hardhat";
import { Contract } from "ethers";
import {Permit2Address} from '../../permit2.utils';

export async function createPermit2ContractAndDeploy(): Promise<Contract> {
    if ((await ethers.provider.getCode(Permit2Address)) === '0x') {
        await ethers.provider.send('hardhat_setCode', [Permit2Address, byteCode.bytecode]);
    }
    return ethers.getContractAt(PERMIT2_ABI, Permit2Address);
}
