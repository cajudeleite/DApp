const { expect } = require("chai");

const initializeContract = async (contractName) => {
  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy();
  return contract;
};

describe("Bacchus", () => {
  let bacchusContract;

  beforeEach(async () => {
    bacchusContract = await initializeContract("Bacchus");
  });

  describe("Testing if the contract owner is:", () => {
    it("Owner", async () => {
      const [owner] = await ethers.getSigners();

      const response = await bacchusContract.owner();
      expect(response).to.eql(owner.address);
    });

    it("Stranger", async () => {
      const [owner, stranger] = await ethers.getSigners();

      const response = await bacchusContract.owner();
      expect(response).not.to.eql(stranger.address);
    });
  });
});

describe("Event", () => {
  let eventContract;
  let stranger;

  beforeEach(async () => {
    eventContract = await initializeContract("Event");
    const [owner, user1] = await ethers.getSigners();
    stranger = user1;
  });

  describe("Testing createEvent:", () => {
    it("With the right arguments", async () => {
      await expect(eventContract.createEvent("Bro", "This is a test", "At my place", "Tomorrow"))
        .to.emit(eventContract, "NewEvent")
        .withArgs(1, "Bro");
    });

    it("With a duplicated name", async () => {
      await eventContract.createEvent("Test", "This is a test", "At my place", "Tomorrow");
      await expect(eventContract.createEvent("Test", "This is a test", "At my place", "Tomorrow")).to.be.rejected;
    });
  });

  describe("Testing closeEvent:", () => {
    it("With open event", async () => {
      await eventContract.createEvent("Test", "This is a test", "At my place", "Tomorrow");
      await expect(eventContract.closeEvent(1)).to.emit(eventContract, "EventClosed").withArgs(1, "Test");
    });

    it("With closed event", async () => {
      await eventContract.createEvent("Test", "This is a test", "At my place", "Tomorrow");
      await eventContract.closeEvent(1);
      await expect(eventContract.closeEvent(1)).to.emit(eventContract, "EventClosed").withArgs(1, "Test");
    });

    it("With unexisting event", async () => {
      await expect(eventContract.closeEvent(1)).to.emit(eventContract, "EventClosed").withArgs(1, "Test");
    });

    it("With stranger", async () => {
      await eventContract.createEvent("Test", "This is a test", "At my place", "Tomorrow");
      await expect(stranger.eventContract.closeEvent(1)).to.emit(eventContract, "EventClosed").withArgs(1, "Test");
    });
  });

  it("Testing getEvent", async () => {
    await eventContract.createEvent("Test", "This is a test", "At my place", "Tomorrow");
    const open = await eventContract.getEvent(1);

    expect(open).to.have.length(5);
    expect(open).to.have.members(["Test", "This is a test", "At my place", "Tomorrow", 0]);

    await eventContract.closeEvent(1);
    await expect(eventContract.getEvent(1)).to.be.revertedWith("Event closed");
  });

  it("Testing searchEvent", async () => {
    await eventContract.createEvent("Test", "This is a test", "At my place", "Tomorrow");
    const response = await eventContract.searchEvent("Test");

    expect(response).to.have.length(5);
    expect(response).to.have.members(["Test", "This is a test", "At my place", "Tomorrow", 0]);
  });
});

describe("Event", () => {});
