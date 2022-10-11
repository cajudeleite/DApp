const { expect } = require("chai");

describe("Bacchus", () => {
  it("Create and get event", async () => {
    const BacchusContract = await ethers.getContractFactory("Bacchus");
    const bacchusContract = await BacchusContract.deploy();

    await bacchusContract.deployed();

    const response = await bacchusContract._createEvent("Test", "This is a test", "At my place", "Tomorrow");

    console.log(response);

    expect(await bacchusContract._getEvent(0)).to.have.property("name");
  });
});
