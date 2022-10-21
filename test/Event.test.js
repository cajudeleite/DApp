const { expect } = require("chai");
const { initializeContract } = require("./Solidity");

describe("Event", () => {
  let eventContract;
  let stranger;

  beforeEach(async () => {
    eventContract = await initializeContract("Event");
    const [addr0, user1] = await ethers.getSigners();
    stranger = user1;
  });

  describe("Testing createEvent", () => {
    it("With the right arguments", async () => {
      await expect(eventContract.createEvent("Bro", "This is a test", "At my place", "Tomorrow"))
        .to.emit(eventContract, "NewEvent")
        .withArgs(1, "Bro");
    });
    describe("With name:", () => {
      describe("Out of range:", () => {
        it("Up", async () => {
          await expect(eventContract.createEvent("Te|st", "This is a test", "At my place", "Tomorrow")).to.be.revertedWith(
            "String is not within range"
          );
        });

        it("Down", async () => {
          await expect(eventContract.createEvent("Te st", "This is a test", "At my place", "Tomorrow")).to.be.revertedWith(
            "String is not within range"
          );
        });
      });

      it("Invalid char", async () => {
        await expect(eventContract.createEvent("Te_st", "This is a test", "At my place", "Tomorrow")).to.be.revertedWith(
          "String contains invalid character"
        );
      });

      it("Too long", async () => {
        await expect(eventContract.createEvent("OmgThisNameIsSoLongThatItWontPass", "This is a test", "At my place", "Tomorrow")).to.be.revertedWith(
          "String exceeds the max length"
        );
      });

      it("Duplicated", async () => {
        await eventContract.createEvent("Test", "This is a test", "At my place", "Tomorrow");
        await expect(eventContract.createEvent("Test", "This is a test", "At my place", "Tomorrow")).to.be.revertedWith("Name already being used");
      });
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
      await expect(eventContract.closeEvent(1)).to.be.revertedWith("Event closed");
    });

    it("With unexisting event", async () => {
      await expect(eventContract.closeEvent(1)).to.be.reverted;
    });

    it("With stranger", async () => {
      await eventContract.createEvent("Test", "This is a test", "At my place", "Tomorrow");
      await expect(eventContract.connect(stranger).closeEvent(1)).to.be.revertedWith("User is not the owner of this event");
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

      await expect(eventContract.getEvent(1)).to.be.revertedWith("Event closed");
    });

    it("With an unexisting event", async () => {
      await expect(eventContract.getEvent(1)).to.be.reverted;
    });
  });

  it("Testing searchEvent", async () => {
    await eventContract.createEvent("Test", "This is a test", "At my place", "Tomorrow");
    const response = await eventContract.searchEvent("Test");

    expect(response).to.have.length(5);
    expect(response).to.have.members(["Test", "This is a test", "At my place", "Tomorrow", 0]);
  });
});
