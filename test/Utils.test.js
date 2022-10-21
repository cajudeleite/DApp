const { expect } = require("chai");
const { initializeContract } = require("./Solidity");

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
      it("Up", async () => {
        const response = await utilsContract.checkIfStringIsValid("Hello|World", range, invalidCharRange, maxLength);
        expect(response).to.eql([false, "String is not within range"]);
      });

      it("Down", async () => {
        const response = await utilsContract.checkIfStringIsValid("Hello World", range, invalidCharRange, maxLength);
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
