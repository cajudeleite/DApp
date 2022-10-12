const { expect } = require("chai");

const initializeContract = async (contractName) => {
  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy();
  return contract;
};

describe("Bacchus", () => {
  it("Testing if msg.sender is owner", async () => {
    const bacchusContract = await initializeContract("Bacchus");

    const owner = await bacchusContract.owner();
    expect(owner).to.eql(bacchusContract.signer.address);
  });

  it("Testing _createEvent", async () => {
    const bacchusContract = await initializeContract("Bacchus");

    await expect(bacchusContract._createEvent("Test", "This is a test", "At my place", "Tomorrow"))
      .to.emit(bacchusContract, "NewEvent")
      .withArgs(0, "Test");
  });

  it("Testing _closeEvent", async () => {
    const bacchusContract = await initializeContract("Bacchus");

    await bacchusContract._createEvent("Test", "This is a test", "At my place", "Tomorrow");

    await expect(bacchusContract._closeEvent(0)).to.emit(bacchusContract, "EventClosed").withArgs(0, "Test");
  });

  it("Testing _getEvent", async () => {
    const bacchusContract = await initializeContract("Bacchus");

    await bacchusContract._createEvent("Test", "This is a test", "At my place", "Tomorrow");
    const open = await bacchusContract._getEvent(0);

    expect(open).to.have.length(5);
    expect(open).to.have.members(["Test", "This is a test", "At my place", "Tomorrow", 0]);

    await bacchusContract._closeEvent(0);
    await expect(bacchusContract._getEvent(0)).to.be.revertedWith("Event closed");
  });

  it("Testing _searchEvent", async () => {
    const bacchusContract = await initializeContract("Bacchus");

    await bacchusContract._createEvent("Test", "This is a test", "At my place", "Tomorrow");
    const response = await bacchusContract._searchEvent("Test");

    expect(response).to.have.length(5);
    expect(response).to.have.members(["Test", "This is a test", "At my place", "Tomorrow", 0]);
  });
});

describe("Event", () => {});
