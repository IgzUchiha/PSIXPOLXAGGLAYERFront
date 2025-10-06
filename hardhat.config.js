require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: '.env.local' });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    cardona: {
      url: process.env.NETWORK_1_RPC || "https://rpc.cardona.zkevm-rpc.com",
      accounts: process.env.USER1_PRIVATE_KEY ? [process.env.USER1_PRIVATE_KEY] : [],
      chainId: 2442,
    },
    sepolia: {
      url: process.env.NETWORK_0_RPC || "https://eth-sepolia.g.alchemy.com/v2/ImMoJ6-3DXKoT-24yJFSS",
      accounts: process.env.USER1_PRIVATE_KEY ? [process.env.USER1_PRIVATE_KEY] : [],
      chainId: 11155111,
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

