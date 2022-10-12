const { expect } = require("chai");

describe("Bacchus", () => {
  it("Testing _createEvent", async () => {
    const BacchusContract = await ethers.getContractFactory("Bacchus");
    const bacchusContract = await BacchusContract.deploy();

    await expect(bacchusContract._createEvent("Test", "This is a test", "At my place", "Tomorrow"))
      .to.emit(bacchusContract, "NewEvent")
      .withArgs(0, "Test", "This is a test");
  });
  it("Testing _getEvent", async () => {
    const BacchusContract = await ethers.getContractFactory("Bacchus");
    const bacchusContract = await BacchusContract.deploy();

    await bacchusContract._createEvent("Test", "This is a test", "At my place", "Tomorrow");
    const response = await bacchusContract._getEvent(0);

    expect(response).not.to.be.undefined;
    expect(response).to.have.property("name", "Test");
    expect(response).to.have.property("description", "This is a test");
    expect(response).to.have.property("location", "At my place");
    expect(response).to.have.property("date", "Tomorrow");
  });
});
