const { expect } = require("chai");

const initializeContract = async (contractName) => {
  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy();
  return contract;
};

describe("Bacchus", () => {
  describe("Testing contract owner:", () => {
    it("Owner", async () => {
      const bacchusContract = await initializeContract("Bacchus");
      const [owner] = await ethers.getSigners();

      const response = await bacchusContract.owner();
      expect(response).to.eql(owner.address);
    });

    it("Stranger", async () => {
      const bacchusContract = await initializeContract("Bacchus");
      const [owner, stranger] = await ethers.getSigners();

      const response = await bacchusContract.owner();
      expect(response).not.to.eql(stranger.address);
    });
  });

  describe("Testing createEvent:", () => {
    let bacchusContract;
    let eventContract;
    beforeEach(async () => {
      bacchusContract = await initializeContract("Bacchus");
      eventContract = await initializeContract("Event");
    });

    it("With the right arguments", async () => {
      await expect(eventContract.createEvent("Test", "This is a test", "At my place", "Tomorrow"))
        .to.emit(bacchusContract, "NewEvent")
        .withArgs(1, "Test");
    });

    // it("With a duplicated name", async () => {
    //   // await bacchusContract._createEvent("Test", "This is a test", "At my place", "Tomorrow");
    //   // await expect(bacchusContract._createEvent("Test", "This is a test", "At my place", "Tomorrow")).to.be.rejected;
    //   const [owner] = await ethers.getSigners();

    //   const response = await bacchusContract.emptyEvent(owner.address);
    //   expect(response).to.eql("crash");
    // });
  });

  it("Testing _closeEvent", async () => {
    const bacchusContract = await initializeContract("Bacchus");

    await bacchusContract._createEvent("Test", "This is a test", "At my place", "Tomorrow");

    await expect(bacchusContract._closeEvent(1)).to.emit(bacchusContract, "EventClosed").withArgs(1, "Test");
  });

  it("Testing _getEvent", async () => {
    const bacchusContract = await initializeContract("Bacchus");

    await bacchusContract._createEvent("Test", "This is a test", "At my place", "Tomorrow");
    const open = await bacchusContract._getEvent(1);

    expect(open).to.have.length(5);
    expect(open).to.have.members(["Test", "This is a test", "At my place", "Tomorrow", 0]);

    await bacchusContract._closeEvent(1);
    await expect(bacchusContract._getEvent(1)).to.be.revertedWith("Event closed");
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
