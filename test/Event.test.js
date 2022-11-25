const { expect } = require("chai");
const { initializeContract } = require("./Solidity");

describe("Event", () => {
  let eventContract;
  let owner;
  let stranger;

  beforeEach(async () => {
    eventContract = await initializeContract("Event");
    const [addr0, addr1] = await ethers.getSigners();
    owner = addr0;
    stranger = addr1;
  });

  describe("\nTesting createEvent", () => {
    it("With the right arguments", async () =>
      await expect(eventContract.createEvent("test", "This is a test", "At my place", Date.now()))
        .to.emit(eventContract, "NewEvent")
        .withArgs(owner.address, 1, "test"));
    describe("With name:", () => {
      describe("Out of range:", () => {
        it("Up", async () => {
          await expect(eventContract.createEvent("te|st", "This is a test", "At my place", Date.now())).to.be.revertedWith(
            "String is not within range"
          );
        });

        it("Down", async () => {
          await expect(eventContract.createEvent("te st", "This is a test", "At my place", Date.now())).to.be.revertedWith(
            "String is not within range"
          );
        });
      });

      it("Invalid char", async () => {
        await expect(eventContract.createEvent("Test", "This is a test", "At my place", Date.now())).to.be.revertedWith(
          "String contains invalid character"
        );
      });

      it("Too short", async () => {
        await expect(eventContract.createEvent("om", "This is a test", "At my place", Date.now())).to.be.revertedWith(
          "String subceeds the min length"
        );
      });

      it("Too long", async () => {
        await expect(
          eventContract.createEvent("omg-this-name-is-so-long-that-it-wont-pass", "This is a test", "At my place", Date.now())
        ).to.be.revertedWith("String exceeds the max length");
      });

      it("Duplicated", async () => {
        await eventContract.createEvent("test", "This is a test", "At my place", Date.now());
        await expect(eventContract.connect(stranger).createEvent("test", "This is a test", "At my place", Date.now())).to.be.revertedWith(
          "Event already exists"
        );
      });
    });

    it("When user already has an event", async () => {
      await eventContract.createEvent("test", "This is a test", "At my place", Date.now());
      await expect(eventContract.createEvent("another-test", "This is a test", "At my place", Date.now())).to.be.revertedWith(
        "User already has an event"
      );
    });
  });

  it("\nTesting getEvents", async () => {
    const createdAt = Date.now();

    await eventContract.createEvent("test", "This is a test", "At my place", createdAt);

    const response = await eventContract.getEvents();
    const transformedResponse = [];

    for (let i = 0; i < response[0].length; i++) {
      const eventObject = {
        id: response[0][i],
        name: response[1][i],
        location: response[2][i],
      };

      transformedResponse.push(eventObject);
    }

    const event = transformedResponse[0];

    expect(transformedResponse).to.have.lengthOf(1);
    expect(event.id.toNumber()).to.eql(1);
    expect(event.name).to.eql("test");
    expect(event.location).to.eql("At my place");
  });

  describe("\nTesting getEvent with event:", () => {
    const createdAt = Date.now();
    beforeEach(async () => await eventContract.createEvent("test", "This is a test", "At my place", createdAt));

    it("Open", async () => {
      const response = await eventContract.getEvent(1);

      expect(response[0]).to.eql("test");
      expect(response[1]).to.eql("This is a test");
      expect(response[2]).to.eql("At my place");
      expect(response[3].toNumber()).to.eql(createdAt);
    });

    it("Closed", async () => {
      await eventContract.closeEvent();
      await expect(eventContract.getEvent(1)).to.be.revertedWith("Event is closed");
    });

    it("Unexisting", async () => {
      await expect(eventContract.getEvent(2)).to.be.revertedWith("Event is either closed or does not exist");
    });
  });

  describe("\nTesting searchEvent", () => {
    describe("With event:", () => {
      const createdAt = Date.now();

      beforeEach(async () => await eventContract.createEvent("test", "This is a test", "At my place", createdAt));

      it("Open", async () => {
        const response = await eventContract.searchEvent("test");

        expect(response[0]).to.eql("test");
        expect(response[1]).to.eql("This is a test");
        expect(response[2]).to.eql("At my place");
        expect(response[3].toNumber()).to.eql(createdAt);
      });

      it("Closed", async () => {
        await eventContract.closeEvent();
        await expect(eventContract.searchEvent("test")).to.be.revertedWith("Event is either closed or does not exist");
      });

      it("Unexisting", async () => {
        await expect(eventContract.searchEvent("not-test")).to.be.revertedWith("Event is either closed or does not exist");
      });
    });

    describe("With name:", () => {
      describe("Out of range:", () => {
        it("Up", async () => {
          await expect(eventContract.searchEvent("te|st")).to.be.revertedWith("String is not within range");
        });

        it("Down", async () => {
          await expect(eventContract.searchEvent("te st")).to.be.revertedWith("String is not within range");
        });
      });

      it("Invalid char", async () => {
        await expect(eventContract.searchEvent("Test")).to.be.revertedWith("String contains invalid character");
      });

      it("Too short", async () => {
        await expect(eventContract.searchEvent("om")).to.be.revertedWith("String subceeds the min length");
      });

      it("Too long", async () => {
        await expect(eventContract.searchEvent("omg-this-name-is-so-long-that-it-wont-pass")).to.be.revertedWith("String exceeds the max length");
      });
    });
  });

  describe("\nTesting updateEvent", () => {
    const createdAt = Date.now();

    beforeEach(async () => await eventContract.createEvent("test", "This is a test", "At my place", createdAt));

    describe("Changing all fields and emit:", () => {
      it("Name", async () =>
        await expect(eventContract.updateEvent("another-test", "This is another description", "At another place", Date.now()))
          .to.emit(eventContract, "EventUpdated")
          .withArgs(owner.address, 1, "Name"));

      it("Description", async () =>
        await expect(eventContract.updateEvent("another-test", "This is another description", "At another place", Date.now()))
          .to.emit(eventContract, "EventUpdated")
          .withArgs(owner.address, 1, "Description"));

      it("Location", async () =>
        await expect(eventContract.updateEvent("another-test", "This is another description", "At another place", Date.now()))
          .to.emit(eventContract, "EventUpdated")
          .withArgs(owner.address, 1, "Location"));

      it("Date", async () =>
        await expect(eventContract.updateEvent("another-test", "This is another description", "At another place", Date.now()))
          .to.emit(eventContract, "EventUpdated")
          .withArgs(owner.address, 1, "Date"));
    });

    it("Changing any field", async () => {
      await expect(eventContract.updateEvent("test", "This is a test", "At my place", createdAt)).not.to.emit(eventContract, "EventUpdated");
    });

    describe("With name:", () => {
      describe("Out of range:", () => {
        it("Up", async () =>
          await expect(eventContract.updateEvent("another|test", "This is a test", "At my place", createdAt)).to.revertedWith(
            "String is not within range"
          ));

        it("Down", async () =>
          await expect(eventContract.updateEvent("another test", "This is a test", "At my place", createdAt)).to.revertedWith(
            "String is not within range"
          ));
      });

      it("Invalid char", async () =>
        await expect(eventContract.updateEvent("AnotherTest", "This is a test", "At my place", createdAt)).to.revertedWith(
          "String contains invalid character"
        ));

      it("Too short", async () =>
        await expect(eventContract.updateEvent("om", "This is a test", "At my place", createdAt)).to.revertedWith("String subceeds the min length"));

      it("Too long", async () =>
        await expect(
          eventContract.updateEvent("omg-this-name-is-so-long-that-it-wont-pass", "This is a test", "At my place", createdAt)
        ).to.revertedWith("String exceeds the max length"));

      it("Duplicated", async () => {
        await eventContract.connect(stranger).createEvent("another-test", "This is a test", "At my place", createdAt);
        await expect(eventContract.updateEvent("another-test", "This is a test", "At my place", createdAt)).to.revertedWith("Event already exists");
      });
    });

    it("With closed event", async () => {
      await eventContract.closeEvent();
      await expect(eventContract.connect(stranger).updateEvent("another-test", "This is a test", "At my place", createdAt)).to.be.revertedWith(
        "Event is either closed or does not exist"
      );
    });
  });

  describe("\nTesting closeEvent", () => {
    describe("With event:", () => {
      beforeEach(async () => await eventContract.createEvent("test", "This is a test", "At my place", Date.now()));

      it("Open", async () => {
        await expect(eventContract.closeEvent()).to.emit(eventContract, "EventClosed").withArgs(owner.address, 1, "test");
      });

      it("Closed", async () => {
        await eventContract.closeEvent();
        await expect(eventContract.closeEvent()).to.be.revertedWith("Event is either closed or does not exist");
      });
    });

    it("Unexisting", async () => {
      await expect(eventContract.closeEvent()).to.be.revertedWith("Event is either closed or does not exist");
    });
  });
});
