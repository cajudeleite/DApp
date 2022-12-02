const { expect } = require("chai");
const { initializeContract } = require("./Solidity");

describe("Bacchus", () => {
  let bacchusContract;
  let owner;
  let stranger;

  beforeEach(async () => {
    const [addr0, addr1] = await ethers.getSigners();
    owner = addr0;
    stranger = addr1;

    bacchusContract = await initializeContract("Bacchus");
  });

  describe("\nTesting if the contract owner is:", () => {
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

  describe("\nTesting changeNameValidRange with:", () => {
    const newRange = [0x32, 0x37];

    it("Owner", async () => {
      await expect(bacchusContract.changeNameValidRange(newRange)).to.emit(bacchusContract, "NameValidRangeChanged").withArgs(["0x32", "0x37"]);
    });

    it("Stranger", async () => {
      await expect(bacchusContract.connect(stranger).changeNameValidRange(newRange)).to.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("\nTesting changeNameInvalidRange with:", () => {
    const newRange = [
      [0x32, 0x37],
      [0x40, 0x47],
    ];

    it("Owner", async () => {
      await expect(bacchusContract.changeNameInvalidRange(newRange)).to.emit(bacchusContract, "NameInvalidRangeChanged");
    });

    it("Stranger", async () => {
      await expect(bacchusContract.connect(stranger).changeNameInvalidRange(newRange)).to.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("\nTesting changeNameMaxLength with:", () => {
    it("Owner", async () => {
      await expect(bacchusContract.changeNameMaxLength(5)).to.emit(bacchusContract, "NameMaxLengthChanged").withArgs(5);
    });

    it("Stranger", async () => {
      await expect(bacchusContract.connect(stranger).changeNameMaxLength(5)).to.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("\nTesting changeNameMinLength with:", () => {
    it("Owner", async () => {
      await expect(bacchusContract.changeNameMinLength(5)).to.emit(bacchusContract, "NameMinLengthChanged").withArgs(5);
    });

    it("Stranger", async () => {
      await expect(bacchusContract.connect(stranger).changeNameMinLength(5)).to.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("\nTesting changeUsernameMaxLength with:", () => {
    it("Owner", async () => {
      await expect(bacchusContract.changeUsernameMaxLength(5)).to.emit(bacchusContract, "UsernameMaxLengthChanged").withArgs(5);
    });

    it("Stranger", async () => {
      await expect(bacchusContract.connect(stranger).changeUsernameMaxLength(5)).to.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("\nTesting changeUsernameMinLength with:", () => {
    it("Owner", async () => {
      await expect(bacchusContract.changeUsernameMinLength(5)).to.emit(bacchusContract, "UsernameMinLengthChanged").withArgs(5);
    });

    it("Stranger", async () => {
      await expect(bacchusContract.connect(stranger).changeUsernameMinLength(5)).to.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("\nTesting setUsername with:", () => {
    it("Valid username", async () => {
      await expect(bacchusContract.setUsername("test")).to.emit(bacchusContract, "UsernameSet").withArgs(owner.address, "test");
    });

    describe("With username:", () => {
      describe("Out of range:", () => {
        it("Up", async () => {
          await expect(bacchusContract.setUsername("te|st")).to.be.revertedWith("String is not within range");
        });

        it("Down", async () => {
          await expect(bacchusContract.setUsername("te st")).to.be.revertedWith("String is not within range");
        });
      });

      it("Invalid char", async () => {
        await expect(bacchusContract.setUsername("Test")).to.be.revertedWith("String contains invalid character");
      });

      it("Too short", async () => {
        await expect(bacchusContract.setUsername("om")).to.be.revertedWith("String subceeds the min length");
      });

      it("Too long", async () => {
        await expect(bacchusContract.setUsername("omg-this-name-is-so-long-that-it-wont-pass")).to.be.revertedWith("String exceeds the max length");
      });

      it("Duplicated", async () => {
        await bacchusContract.setUsername("test");
        await expect(bacchusContract.connect(stranger).setUsername("test")).to.be.revertedWith("Username is already taken");
      });
    });

    it("Already has an username", async () => {
      await bacchusContract.setUsername("test");
      await expect(bacchusContract.setUsername("test-two")).to.be.revertedWith("User already has an username");
    });
  });

  describe("\nTesting userFirstConnection with user:", () => {
    it("Without username", async () => {
      const response = await bacchusContract.userFirstConnection();

      expect(response).to.be.true;
    });

    it("With username", async () => {
      await bacchusContract.setUsername("test");
      const response = await bacchusContract.userFirstConnection();

      expect(response).to.be.false;
    });
  });
});
