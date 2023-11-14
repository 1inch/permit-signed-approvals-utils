import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomicfoundation/hardhat-chai-matchers";
import "hardhat-dependency-compiler";
import "hardhat-deploy";
import { HardhatUserConfig } from "hardhat/types";

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.19',
        settings: {
            optimizer: {
                enabled: true,
                runs: 100,
            },
            viaIR: true,
        },
    },
    networks: {
        hardhat: {
            chainId: 1
        }
    },
    defaultNetwork: "hardhat",
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    paths: {
        sources: "./src/e2e/",
        tests: "./src/e2e/",
        cache: "./cache",
        artifacts: "./artifacts"
    },
};

export default config;
