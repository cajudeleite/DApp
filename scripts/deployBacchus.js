const deploy = async () => {
  try {
    const BacchusContract = await ethers.getContractFactory("Bacchus");
    const bacchusContract = await MyContract.deploy();

    console.log("My Contract deployed to:", myContract.address);
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

deploy();
