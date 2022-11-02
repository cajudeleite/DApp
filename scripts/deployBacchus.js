const deploy = async () => {
  try {
    const BacchusContract = await ethers.getContractFactory("Event");
    const bacchusContract = await BacchusContract.deploy();

    console.log("My Contract deployed to:", bacchusContract.address);
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

deploy();
