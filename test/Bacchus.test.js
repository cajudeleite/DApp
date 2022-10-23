const { expect } = require("chai");
const { initializeContract } = require("./Solidity");

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
});
