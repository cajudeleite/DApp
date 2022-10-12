const { expect } = require("chai");

const initializeContract = async () => {
  const BacchusContract = await ethers.getContractFactory("Bacchus");
  const bacchusContract = await BacchusContract.deploy();
  return bacchusContract;
};

describe("Bacchus", () => {
  it("Testing if msg.sender is owner", async () => {
    const bacchusContract = await initializeContract();

    const isOwner = await bacchusContract.isOwner();
    expect(isOwner).to.be.true;

    // const owner = await bacchusContract.owner();
    // expect(owner).to.eql(bacchusContract.signer.address);
  });

  it("Testing _createEvent", async () => {
    const bacchusContract = await initializeContract();

    await expect(bacchusContract._createEvent("Test", "This is a test", "At my place", "Tomorrow"))
      .to.emit(bacchusContract, "NewEvent")
      .withArgs(0, "Test", "This is a test");
  });

  it("Testing _getEvent", async () => {
    const bacchusContract = await initializeContract();

    await bacchusContract._createEvent("Test", "This is a test", "At my place", "Tomorrow");
    const response = await bacchusContract._getEvent(0);

    expect(response).not.to.be.undefined;
    expect(response).to.have.property("name", "Test");
    expect(response).to.have.property("description", "This is a test");
    expect(response).to.have.property("location", "At my place");
    expect(response).to.have.property("date", "Tomorrow");
  });
});
