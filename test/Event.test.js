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

  describe("\nTesting createEvent", () => {
    it("With the right arguments", async () =>
      await expect(eventContract.createEvent("Test", "This is a test", "At my place", Date.now()))
        .to.emit(eventContract, "NewEvent")
        .withArgs(1, "Test"));
    describe("With name:", () => {
      describe("Out of range:", () => {
        it("Up", async () => {
          await expect(eventContract.createEvent("Te|st", "This is a test", "At my place", Date.now())).to.be.revertedWith(
            "String is not within range"
          );
        });

        it("Down", async () => {
          await expect(eventContract.createEvent("Te st", "This is a test", "At my place", Date.now())).to.be.revertedWith(
            "String is not within range"
          );
        });
      });

      it("Invalid char", async () => {
        await expect(eventContract.createEvent("Te_st", "This is a test", "At my place", Date.now())).to.be.revertedWith(
          "String contains invalid character"
        );
      });

      it("Too long", async () => {
        await expect(eventContract.createEvent("OmgThisNameIsSoLongThatItWontPass", "This is a test", "At my place", Date.now())).to.be.revertedWith(
          "String exceeds the max length"
        );
      });

      it("When user already has an event", async () => {
        await eventContract.createEvent("Test", "This is a test", "At my place", Date.now());
        await expect(eventContract.createEvent("AnotherTest", "This is a test", "At my place", Date.now())).to.be.revertedWith(
          "User already has an event"
        );
      });

      it("Duplicated", async () => {
        await eventContract.createEvent("Test", "This is a test", "At my place", Date.now());
        await expect(eventContract.connect(stranger).createEvent("Test", "This is a test", "At my place", Date.now())).to.be.revertedWith(
          "Event already exists"
        );
      });
    });
  });

  it("\nTesting getEvents", async () => {
    const createdAt = Date.now();

    await eventContract.createEvent("Test", "This is a test", "At my place", createdAt);
    const filteredResponse = await eventContract.getEvents();
    const event = filteredResponse[0];

    expect(filteredResponse).to.have.lengthOf(1);
    expect(event[0]).to.eql("Test");
    expect(event[1]).to.eql("This is a test");
    expect(event[2]).to.eql("At my place");
    expect(event[3].toNumber()).to.equal(createdAt);
    expect(event[4]).to.eql(false);
  });

  describe("\nTesting getEvent with event:", () => {
    const createdAt = Date.now();
    beforeEach(async () => await eventContract.createEvent("Test", "This is a test", "At my place", createdAt));

    it("Open", async () => {
      const response = await eventContract.getEvent(1);

      expect(response[0]).to.eql("Test");
      expect(response[1]).to.eql("This is a test");
      expect(response[2]).to.eql("At my place");
      expect(response[3].toNumber()).to.eql(createdAt);
    });

    it("Closed", async () => {
      await eventContract.closeEvent(1);
      await expect(eventContract.getEvent(1)).to.be.revertedWith("Event is closed");
    });

    it("Unexisting", async () => {
      await expect(eventContract.getEvent(2)).to.be.revertedWith("Event does not exist");
    });
  });

  describe("\nTesting searchEvent", () => {
    describe("With event:", () => {
      const createdAt = Date.now();
      beforeEach(async () => await eventContract.createEvent("Test", "This is a test", "At my place", createdAt));

      it("Open", async () => {
        const response = await eventContract.searchEvent("Test");

        expect(response[0]).to.eql("Test");
        expect(response[1]).to.eql("This is a test");
        expect(response[2]).to.eql("At my place");
        expect(response[3].toNumber()).to.eql(createdAt);
      });

      it("Closed", async () => {
        await eventContract.closeEvent(1);
        await expect(eventContract.searchEvent("Test")).to.be.revertedWith("Event is closed");
      });

      it("Unexisting", async () => {
        await expect(eventContract.searchEvent("NotTest")).to.be.revertedWith("Event does not exist");
      });
    });

    describe("With name:", () => {
      describe("Out of range:", () => {
        it("Up", async () => {
          await expect(eventContract.searchEvent("Te|st")).to.be.revertedWith("String is not within range");
        });

        it("Down", async () => {
          await expect(eventContract.searchEvent("Te st")).to.be.revertedWith("String is not within range");
        });
      });

      it("Invalid char", async () => {
        await expect(eventContract.searchEvent("Te_st")).to.be.revertedWith("String contains invalid character");
      });

      it("Too long", async () => {
        await expect(eventContract.searchEvent("OmgThisNameIsSoLongThatItWontPass")).to.be.revertedWith("String exceeds the max length");
      });
    });
  });

  describe("\nTesting updateEvent", () => {
    const createdAt = Date.now();

    beforeEach(async () => await eventContract.createEvent("Test", "This is a test", "At my place", createdAt));

    describe("Changing all fields and emit:", () => {
      it("Name", async () =>
        await expect(eventContract.updateEvent(1, "Another", "This is another description", "At another place", Date.now()))
          .to.emit(eventContract, "EventUpdated")
          .withArgs(1, "Name"));

      it("Description", async () =>
        await expect(eventContract.updateEvent(1, "Another", "This is another description", "At another place", Date.now()))
          .to.emit(eventContract, "EventUpdated")
          .withArgs(1, "Description"));

      it("Location", async () =>
        await expect(eventContract.updateEvent(1, "Another", "This is another description", "At another place", Date.now()))
          .to.emit(eventContract, "EventUpdated")
          .withArgs(1, "Location"));

      it("Date", async () =>
        await expect(eventContract.updateEvent(1, "Another", "This is another description", "At another place", Date.now()))
          .to.emit(eventContract, "EventUpdated")
          .withArgs(1, "Date"));
    });

    it("Changing any field", async () => {
      await expect(eventContract.updateEvent(1, "Test", "This is a test", "At my place", createdAt)).not.to.emit(eventContract, "EventUpdated");
    });

    describe("With name:", () => {
      describe("Out of range:", () => {
        it("Up", async () =>
          await expect(eventContract.updateEvent(1, "Another|Test", "This is a test", "At my place", createdAt)).to.revertedWith(
            "String is not within range"
          ));

        it("Down", async () =>
          await expect(eventContract.updateEvent(1, "Another Test", "This is a test", "At my place", createdAt)).to.revertedWith(
            "String is not within range"
          ));
      });

      it("Invalid char", async () =>
        await expect(eventContract.updateEvent(1, "Another_Test", "This is a test", "At my place", createdAt)).to.revertedWith(
          "String contains invalid character"
        ));

      it("Too long", async () =>
        await expect(eventContract.updateEvent(1, "OmgThisNameIsSoLongThatItWontPass", "This is a test", "At my place", createdAt)).to.revertedWith(
          "String exceeds the max length"
        ));

      it("Duplicated", async () => {
        await eventContract.connect(stranger).createEvent("AnotherTest", "This is a test", "At my place", createdAt);
        await expect(eventContract.updateEvent(1, "AnotherTest", "This is a test", "At my place", createdAt)).to.revertedWith("Event already exists");
      });
    });

    it("With closed event", async () => {
      await eventContract.closeEvent(1);
      await expect(eventContract.connect(stranger).updateEvent(1, "AnotherTest", "This is a test", "At my place", createdAt)).to.be.revertedWith(
        "Event is closed"
      );
    });

    it("With unexisting event", async () => {
      await expect(eventContract.connect(stranger).updateEvent(2, "AnotherTest", "This is a test", "At my place", createdAt)).to.be.revertedWith(
        "Event does not exist"
      );
    });

    it("With stranger", async () => {
      await expect(eventContract.connect(stranger).updateEvent(1, "OnceAnotherTest", "This is a test", "At my place", createdAt)).to.be.revertedWith(
        "User is not the owner of this event"
      );
    });
  });

  describe("\nTesting closeEvent", () => {
    beforeEach(async () => await eventContract.createEvent("Test", "This is a test", "At my place", Date.now()));

    describe("With event:", () => {
      it("Open", async () => {
        await expect(eventContract.closeEvent(1)).to.emit(eventContract, "EventClosed").withArgs(1, "Test");
      });

      it("Closed", async () => {
        await eventContract.closeEvent(1);
        await expect(eventContract.closeEvent(1)).to.be.revertedWith("Event is closed");
      });

      it("Unexisting", async () => {
        await expect(eventContract.closeEvent(2)).to.be.revertedWith("Event does not exist");
      });
    });

    it("With stranger", async () => {
      await expect(eventContract.connect(stranger).closeEvent(1)).to.be.revertedWith("User is not the owner of this event");
    });
  });
});
