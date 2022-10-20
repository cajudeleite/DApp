const { expect } = require("chai");

const initializeContract = async (contractName) => {
  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy();
  return contract;
};

describe("Bacchus", () => {
  let bacchusContract;
  let owner;
  let stranger;

  beforeEach(async () => {
    bacchusContract = await initializeContract("Bacchus");
    const [addr0, addr1] = await ethers.getSigners();
    owner = addr0;
    stranger = addr1;
  });

  describe("Testing if the contract owner is:", () => {
    it("Owner", async () => {
      const [owner] = await ethers.getSigners();

      const response = await bacchusContract.owner();
      expect(response).to.eql(owner.address);
    });

    it("Stranger", async () => {
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
    const [addr0, user1] = await ethers.getSigners();
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
      expect(eventContract.createEvent("Test", "This is a test", "At my place", "Tomorrow")).to.be.rejected;
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
      expect(eventContract.closeEvent(1)).to.be.revertedWith("Event closed");
    });

    it("With unexisting event", async () => {
      expect(eventContract.closeEvent(1)).to.be.rejected;
    });

    it("With stranger", async () => {
      await eventContract.createEvent("Test", "This is a test", "At my place", "Tomorrow");
      expect(eventContract.connect(stranger).closeEvent(1)).to.be.revertedWith("User is not the owner of this event");
    });
  });

  describe("Testing getEvent:", () => {
    it("With an existing event", async () => {
      await eventContract.createEvent("Test", "This is a test", "At my place", "Tomorrow");
      const open = await eventContract.getEvent(1);

      expect(open).to.have.length(5);
      expect(open).to.have.members(["Test", "This is a test", "At my place", "Tomorrow", 0]);
    });

    it("With a closed event", async () => {
      await eventContract.createEvent("Test", "This is a test", "At my place", "Tomorrow");
      await eventContract.closeEvent(1);

      expect(eventContract.getEvent(1)).to.be.revertedWith("Event closed");
    });

    it("With an unexisting event", async () => {
      expect(eventContract.getEvent(1)).to.be.reverted;
    });
  });

  it("Testing searchEvent", async () => {
    await eventContract.createEvent("Test", "This is a test", "At my place", "Tomorrow");
    const response = await eventContract.searchEvent("Test");

    expect(response).to.have.length(5);
    expect(response).to.have.members(["Test", "This is a test", "At my place", "Tomorrow", 0]);
  });
});

describe("Utils", () => {
  let utilsContract;
  const range = [0x30, 0x7a];
  const invalidCharRange = [
    [0x3a, 0x40],
    [0x5b, 0x60],
  ];
  const maxLength = 20;

  beforeEach(async () => {
    utilsContract = await initializeContract("Utils");
    const [addr0, addr1] = await ethers.getSigners();
    owner = addr0;
    stranger = addr1;
  });

  describe("Testing checkIfStringIsValid with string:", () => {
    it("Valid", async () => {
      const response = await utilsContract.checkIfStringIsValid("HelloWorld", range, invalidCharRange, maxLength);
      expect(response).to.eql([true, "String is valid"]);
    });

    describe("Out of range:", () => {
      it("Down", async () => {
        const response = await utilsContract.checkIfStringIsValid("Hello World", range, invalidCharRange, maxLength);
        expect(response).to.eql([false, "String is not within range"]);
      });

      it("Up", async () => {
        const response = await utilsContract.checkIfStringIsValid("Hello|World", range, invalidCharRange, maxLength);
        expect(response).to.eql([false, "String is not within range"]);
      });
    });

    it("Invalid char", async () => {
      const response = await utilsContract.checkIfStringIsValid("Hello_World", range, invalidCharRange, maxLength);
      expect(response).to.eql([false, "String contains invalid character"]);
    });

    it("Too long", async () => {
      const response = await utilsContract.checkIfStringIsValid("HelloWorldaaaaaaaaaaaaqaaaa", range, invalidCharRange, maxLength);
      expect(response).to.eql([false, "String exceeds the max length"]);
    });
  });
});
