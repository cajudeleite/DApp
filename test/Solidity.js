const initializeContract = async (contractName) => {
  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy();
  return contract;
};

module.exports = { initializeContract };
