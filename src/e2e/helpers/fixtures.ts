import { ethers } from "hardhat";
import { Contract } from "ethers";

export async function deploySwapTokens(): Promise<{
    dai: Contract;
    inch: Contract;
    chainId: number;
    usdc: Contract;
}> {
    const TokenMock = await ethers.getContractFactory('TokenMock');
    const dai = await TokenMock.deploy('DAI', 'DAI');
    await dai.deployed();
    const inch = await TokenMock.deploy('1INCH', '1INCH');
    await inch.deployed();
    const TokenCustomDecimalsMock = await ethers.getContractFactory('TokenCustomDecimalsMock');
    const usdc = await TokenCustomDecimalsMock.deploy('USDC', 'USDC', '0', 6);
    await usdc.deployed();
    const chainId = (await ethers.provider.getNetwork()).chainId;
    return { dai, inch, chainId, usdc };
};
