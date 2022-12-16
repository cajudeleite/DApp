require("solidity-coverage");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-ethers");
/** @type import('hardhat/config').HardhatUserConfig */

const ALCHEMY_API_KEY = "";
const GOERLI_PRIVATE_KEY = "";

module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY],
    },
  },
};
