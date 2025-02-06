// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
contract PiggyBank {

    address public owner;

    // Event deposits and withdrawals
    event Deposited(address indexed sender, uint256 amount);
    event Withdrawn(address indexed receiver, uint256 amount);

    // Constructor to set the owner when the contract is deployed
    constructor() {
        owner = msg.sender;
    }

    // Only the owner can perform this kind of actions
    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    // Function to deposit ETH into the contract
    function deposit() external payable {
        require(msg.value > 0, "You must deposit some ETH");
        emit Deposited(msg.sender, msg.value);
    }

    // Function to withdraw ETH from the contract
    function withdraw(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Not enough balance");
        payable(owner).transfer(amount);
        emit Withdrawn(owner, amount);
    }

    // Function to check the contract's balance
    function balance() external view returns (uint256) {
        return address(this).balance;
    }

    // Function to check the owner's balance in the contract
    function ownerBalance() external view returns (uint256) {
        return address(this).balance;
    }
}