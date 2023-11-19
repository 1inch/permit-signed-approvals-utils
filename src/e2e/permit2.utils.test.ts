import { ethers } from "hardhat";
import { deploySwapTokens } from "./helpers/fixtures";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { Permit2Utils } from "../permit2.utils";
import { getProviderConnector, Signer } from "./helpers/provider-connector.mock";
import { MaxUint256, PERMIT2_ADDRESS } from "@uniswap/permit2-sdk";
import { expect } from 'chai';
import { decodeUncompressedPermitSingle } from "./helpers/decode-uncompressed-permit-single";
import { createPermit2ContractAndDeploy } from "./helpers/create-permit2-contract-and-deployt";
import { parseUnits } from "ethers/lib/utils";
import { trim0x } from "../helpers/trim-0x";
import { Contract } from "ethers";
import { ProviderConnector } from "../connector/provider.connector";

const SPENDER_ADDRESS = '0x1111111254eeb25477b68fb85ed929f73a960582';

export function ether(n: string): bigint {
    return parseUnits(n).toBigInt();
}

describe('permit2',  () => {
    let addr: Signer, addr1: Signer;

    async function initContracts(dai: Contract): Promise<void>{
        await dai.mint(addr1.address, ether('1000000'));
        await dai.mint(addr.address, ether('1000000'));
    }

    beforeEach(async  () => {
        [addr, addr1] = await ethers.getSigners();
    });


    describe('permit2', async () => {
        let dai: Contract;
        let chainId: number;
        let permit2C2: Contract;
        let providerConnector: ProviderConnector;
        let permit2Builder: Permit2Utils;

        const deployContractsAndInit = async () => {
            const { dai, chainId } = await deploySwapTokens();
            await initContracts(dai);
            return { dai, chainId };
        };

        beforeEach(async () => {
            const result = await loadFixture(deployContractsAndInit);
            dai = result.dai;
            chainId = result.chainId;
            permit2C2 = await createPermit2ContractAndDeploy();
            providerConnector = getProviderConnector(addr1);
            permit2Builder = new Permit2Utils(
                providerConnector
            );
        })

        const decodePermitAndCall = async (decompressedPermit: string) => {
            const decodedPermit = decodeUncompressedPermitSingle(decompressedPermit);

            await permit2C2.permit(
                addr1.address,
                decodedPermit.permitSingle,
                decodedPermit.signature.r + trim0x(decodedPermit.signature.yParityAndS)
            );
        }

        describe('decompressed singlePermit', async () => {
            it('infinite expiry', async () => {
                await dai.connect(addr1).approve(PERMIT2_ADDRESS, 1);

                const decompressedPermit = await permit2Builder.buildPermit2({
                    walletAddress: addr1.address,
                    spender: SPENDER_ADDRESS,
                    value: BigInt(1),
                    tokenAddress: dai.address,
                    nonce: BigInt(0),
                    chainId,
                });

                await decodePermitAndCall(decompressedPermit);

                const result = await permit2C2.allowance(
                    addr1.address,
                    dai.address,
                    SPENDER_ADDRESS
                );
                expect(result.amount.toBigInt()).to.equal(BigInt(1));
                expect(result.nonce).to.equal(1);
            });

            it('set expiry & sigDeadline', async () => {
                await dai.connect(addr1).approve(PERMIT2_ADDRESS, MaxUint256.toBigInt());

                const deadline = Math.round((Date.now() / 1000)) + 3000;

                const decompressedPermit = await permit2Builder.buildPermit2({
                    walletAddress: addr1.address,
                    spender: SPENDER_ADDRESS,
                    value: BigInt(2),
                    tokenAddress: dai.address,
                    nonce: BigInt(0),
                    chainId,
                    expiry: BigInt(deadline),
                    sigDeadline: BigInt(deadline) + BigInt(1)
                });

                await decodePermitAndCall(decompressedPermit);

                const result = await permit2C2.allowance(
                    addr1.address,
                    dai.address,
                    SPENDER_ADDRESS
                );
                expect(result.amount.toBigInt()).to.equal(BigInt(2));
                expect(result.nonce).to.equal(1);
                expect(result.expiration).to.equal(deadline);
            });
        });
    });
});
