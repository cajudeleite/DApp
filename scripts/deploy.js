const deploy = async () => {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Bacchus = await ethers.getContractFactory("Event");
  const bacchus = await Bacchus.deploy();

  console.log("Bacchus address:", bacchus.address);
};

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
