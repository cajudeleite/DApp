const { expect } = require("chai");

describe("Bacchus", () => {
  it("Create event", async () => {
    const BacchusContract = await ethers.getContractFactory("Bacchus");
    const bacchusContract = await BacchusContract.deploy();

    await expect(bacchusContract._createEvent("Test", "This is a test", "At my place", "Tomorrow")).to.emit(bacchusContract, "NewEvent").withArgs();
  });
  // it("Create event", async () => {
  //   const BacchusContract = await ethers.getContractFactory("Bacchus");
  //   const bacchusContract = await BacchusContract.deploy();

  //   await expect(bacchusContract._createEvent("Test", "This is a test", "At my place", "Tomorrow")).to.emit(bacchusContract, "NewEvent");
  // });
});
