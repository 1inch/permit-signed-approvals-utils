import { ethers } from "hardhat";
import { ether, trim0x } from "@1inch/solidity-utils";
import { deploySwapTokens } from "./helpers/fixtures";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { Permit2Builder } from "../permit2-builder";
import { getProviderConnector } from "./helpers/provider-connector.mock";
import {
    SignerWithAddress,
} from "@1inch/solidity-utils/node_modules/@nomiclabs/hardhat-ethers/signers";
import { PERMIT2_ADDRESS } from "@uniswap/permit2-sdk";
import { expect } from 'chai';
import { decodeUncompressedPermitSingle } from "./helpers/decode-uncompressed-permit-single";
import { createPermit2ContractAndDeploy } from "./helpers/create-permit2-contract-and-deployt";

const SPENDER_ADDRESS = '0x1111111254eeb25477b68fb85ed929f73a960582';
describe('permit2',  () => {
    let addr: SignerWithAddress, addr1: SignerWithAddress;

    async function initContracts(dai): Promise<void>{
        await dai.mint(addr1.address, ether('1000000'));
        await dai.mint(addr.address, ether('1000000'));
    }

    beforeEach(async  () => {
        [addr, addr1] = await ethers.getSigners();
    });


    describe('permit2', async () => {
        const deployContractsAndInit = async () => {
            const { dai, chainId } = await deploySwapTokens();
            await initContracts(dai);
            return { dai, chainId };
        };

        it('decompressed singlePermit', async () => {
            const { dai, chainId } = await loadFixture(deployContractsAndInit);

            const permit2C2 = await createPermit2ContractAndDeploy();
            await dai.connect(addr1).approve(PERMIT2_ADDRESS, 1);

            const providerConnector = getProviderConnector(addr1);

            const permit2Builder = new Permit2Builder(
                providerConnector
            );

            const decompressedPermit = await permit2Builder.buildPermit2({
                walletAddress: addr1.address,
                spender: SPENDER_ADDRESS,
                value: BigInt(1),
                tokenAddress: dai.address,
                nonce: BigInt(0),
                chainId,
            });

            const decodedPermit = decodeUncompressedPermitSingle(decompressedPermit);

            await permit2C2.permit(
                addr1.address,
                decodedPermit.permitSingle,
                decodedPermit.signature.r + trim0x(decodedPermit.signature.yParityAndS)
            );

            const result2 = await permit2C2.allowance(addr1.address, dai.address, SPENDER_ADDRESS);
            expect(result2.amount.toBigInt()).to.equal(BigInt(1));
            expect(result2.nonce).to.equal(1);
        })
    });
});
