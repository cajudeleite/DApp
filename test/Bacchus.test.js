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
});
