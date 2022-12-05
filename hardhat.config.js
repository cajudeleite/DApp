require("solidity-coverage");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-ethers");
/** @type import('hardhat/config').HardhatUserConfig */

const ALCHEMY_API_KEY = "RD4iKvBn6emYTABjtQEIwLPSPeu4zbDZ";
const GOERLI_PRIVATE_KEY = "84bdecc508426e9825dfd893e33e78ec4f1fb2e044ae475a5342481d9c716072";

module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY],
    },
  },
};
