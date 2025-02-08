import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("PiggyBank Contract", function () {
  async function deployPiggyBankFixture() {
    const [owner, account1] = await hre.ethers.getSigners();
    const PiggyBank = await hre.ethers.getContractFactory("PiggyBank");
    const deployedPiggyBank = await PiggyBank.deploy();

    return { deployedPiggyBank, owner, account1 };
  }

  describe("Deployment", function () {
    it("should be deployed by the owner", async function () {
      const { deployedPiggyBank, owner } = await loadFixture(deployPiggyBankFixture);
      expect(await deployedPiggyBank.owner()).to.equal(owner.address);
    });
  });

  describe("Deposit Functionality", function () {
    it("should allow a user to deposit ETH and emit an event", async function () {
      const { deployedPiggyBank, account1 } = await loadFixture(deployPiggyBankFixture);
      const depositAmount = hre.ethers.parseEther("1");

      await expect(deployedPiggyBank.connect(account1).deposit({ value: depositAmount }))
        .to.emit(deployedPiggyBank, "Deposited")
        .withArgs(account1.address, depositAmount);

      // Check contract balance
      const contractBalance = await hre.ethers.provider.getBalance(deployedPiggyBank.target);
      expect(contractBalance).to.equal(depositAmount);
    });

    it("should reject deposits of 0 ETH", async function () {
      const { deployedPiggyBank, account1 } = await loadFixture(deployPiggyBankFixture);
      await expect(deployedPiggyBank.connect(account1).deposit({ value: 0 }))
        .to.be.revertedWith("You must deposit some ETH");
    });
  });

  describe("Withdraw Functionality", function () {
    it("should allow only the owner to withdraw ETH", async function () {
      const { deployedPiggyBank, owner } = await loadFixture(deployPiggyBankFixture);
      const depositAmount = hre.ethers.parseEther("2");

      // Deposit 2 ETH
      await deployedPiggyBank.deposit({ value: depositAmount });

      // Check balance before withdrawal
      const contractBalanceBefore = await hre.ethers.provider.getBalance(deployedPiggyBank.target);
      expect(contractBalanceBefore).to.equal(depositAmount);

      // Withdraw 1 ETH
      const withdrawAmount = hre.ethers.parseEther("1");
      await expect(deployedPiggyBank.withdraw(withdrawAmount))
        .to.emit(deployedPiggyBank, "Withdrawn")
        .withArgs(owner.address, withdrawAmount);

      // Check balance after withdrawal
      const contractBalanceAfter = await hre.ethers.provider.getBalance(deployedPiggyBank.target);
      expect(contractBalanceAfter).to.equal(depositAmount - withdrawAmount);
    });

    it("should reject withdrawals larger than contract balance", async function () {
      const { deployedPiggyBank, owner } = await loadFixture(deployPiggyBankFixture);

      // Try to withdraw without depositing
      const withdrawAmount = hre.ethers.parseEther("1");
      await expect(deployedPiggyBank.withdraw(withdrawAmount))
        .to.be.revertedWith("Not enough balance");
    });

    it("should prevent non-owners from withdrawing", async function () {
      const { deployedPiggyBank, account1 } = await loadFixture(deployPiggyBankFixture);
      await expect(deployedPiggyBank.connect(account1).withdraw(hre.ethers.parseEther("1")))
        .to.be.revertedWith("You are not the owner");
    });
  });

  describe("Balance Checks", function () {
    it("should return the correct contract balance", async function () {
      const { deployedPiggyBank, account1 } = await loadFixture(deployPiggyBankFixture);
      const depositAmount = hre.ethers.parseEther("1");

      // Deposit ETH
      await deployedPiggyBank.connect(account1).deposit({ value: depositAmount });

      // Check contract balance
      expect(await deployedPiggyBank.balance()).to.equal(depositAmount);
    });

    it("should return the correct owner balance", async function () {
      const { deployedPiggyBank, account1 } = await loadFixture(deployPiggyBankFixture);
      const depositAmount = hre.ethers.parseEther("2");

      // Deposit ETH
      await deployedPiggyBank.connect(account1).deposit({ value: depositAmount });

      // Check owner's balance in contract
      expect(await deployedPiggyBank.ownerBalance()).to.equal(depositAmount);
    });
  });
});
