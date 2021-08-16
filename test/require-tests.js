const { expect } = require("chai");
const { ethers } = require("hardhat");
const { abi, bytecode } = require("usingtellor/artifacts/contracts/TellorPlayground.sol/TellorPlayground.json")

describe("TellorPush User Require Tests", function() {
    // Set-up for playground, oracle, user, and gas
    let tellorPlayground;
    let tellorPushOracle;
    let tellorPushUser;
    let erc20;
    let startingGas = 2.0;

    beforeEach(async function() {
        // Deploy an instance of Tellor Playground
        const TellorPlayground = await ethers.getContractFactory(abi, bytecode);
        tellorPlayground = await TellorPlayground.deploy();
        await tellorPlayground.deployed();

        // Deploy an instance of ERC20 Token
        const ERC20 = await ethers.getContractFactory("ERC20");
        erc20 = await ERC20.deploy("Tribute", "TRB");
        await erc20.deployed();

        // Deploy an instance of Tellor Push Oracle
        const TellorPushOracle = await ethers.getContractFactory("TellorPushOracle");
        tellorPushOracle = await TellorPushOracle.deploy(tellorPlayground.address, erc20.address);
        await tellorPushOracle.deployed();
        await erc20.faucet(tellorPushOracle.address, 1000);

        // Deploy an instance of Tellor Push User
        const TellorPushUser = await ethers.getContractFactory("TellorPushUser");
        tellorPushUser = await TellorPushUser.deploy(tellorPushOracle.address, erc20.address);
        await tellorPushUser.deployed();
        await erc20.faucet(tellorPushUser.address, 1000);

        // Send ether to oracle and user contracts
        [owner] = await ethers.getSigners();
        await owner.sendTransaction({
            to: tellorPushOracle.address,
            value: ethers.utils.parseEther(startingGas.toString()),
        });
        await owner.sendTransaction({
            to: tellorPushUser.address,
            value: ethers.utils.parseEther(startingGas.toString()),
        });
    });

    // receiveResult does not take a non-approved contract address
    it ("Fail if receiveResult takes a non-approved contract address", async function() {
        // Direct call to receiveResult with non oracle address
        await expect(tellorPushUser.receiveResult(1, 20, 2000)).to.be.revertedWith("The address is not an approved oracle!");
    });

    // receiveResult does not take a non-approved oracle address
    it ("Fail if receiveResult takes a non-approved oracle address", async function() {
        // Push values to Tellor Playground
        const requestId = 1;
        const mockValue = 300;
        await tellorPlayground.submitValue(requestId, mockValue);

        // Deploy a separate instance of Tellor Push Oracle
        const OtherTellorPushOracle = await ethers.getContractFactory("TellorPushOracle");
        otherTellorPushOracle = await OtherTellorPushOracle.deploy(tellorPlayground.address, erc20.address);
        await otherTellorPushOracle.deployed();
        await erc20.faucet(tellorPushOracle.address, 1000);

        // Expect failure if not an approved oracle address
        await expect(otherTellorPushOracle.pushNewData(requestId, tellorPushUser.address)).to.be.revertedWith("The address is not an approved oracle!");
    });

    // receiveResult passes if a Tellor oracle calls the function
    it ("Succeeds if receiveResult is called from within the Tellor Oracle", async function() {
        // Push values to Tellor Playground
        const requestId = 3;
        const mockValue = 300;
        await tellorPlayground.submitValue(requestId, mockValue);

        // Push data, and get the call back
        await tellorPushOracle.pushNewData(requestId, tellorPushUser.address);
        await expect(tellorPushUser.getUserValue(requestId));
    })    

    // Check if message fails if last request ID was already same as looked at
    it ("Fails if receiveResult gets the exact same request ID two times in a row", async function() {
        // Push values to Tellor Playground
        const requestId = 3;
        const mockValue = 300;
        await tellorPlayground.submitValue(requestId, mockValue);

        // Push data, and get the call back
        await tellorPushOracle.pushNewData(requestId, tellorPushUser.address);
        await expect(tellorPushOracle.pushNewData(requestId, tellorPushUser.address)).to.be.revertedWith("'This request ID has been called before!'");
    })

    // Works if last request ID was different than last looked at
    it ("Succeeds if two separate request IDs are requested/pushed by Tellor Oracle", async function() {
        // Push values to Tellor Playground
        var requestId = 3;
        var mockValue = 300;
        await tellorPlayground.submitValue(requestId, mockValue);

        // Grab value, and push values again
        await tellorPushOracle.pushNewData(requestId, tellorPushUser.address);
        requestId = 2;
        mockValue = 400;
        await tellorPlayground.submitValue(requestId, mockValue);

        // Grab value again -- works for two different request IDs
        await tellorPushOracle.pushNewData(requestId, tellorPushUser.address);
    })

    it ("Fail if user does not have enough tributes to transfer", async function() {
        // Deploy an instance of Tellor Push User
        const OtherTellorPushUser = await ethers.getContractFactory("TellorPushUser");
        otherTellorPushUser = await OtherTellorPushUser.deploy(tellorPushOracle.address, erc20.address);
        await otherTellorPushUser.deployed();

        // Deposit tributes and ether to the smart contract
        await owner.sendTransaction({
            to: otherTellorPushUser.address,
            value: ethers.utils.parseEther("2.0"), // Sends exactly 1.0 ether
        });
        await erc20.faucet(otherTellorPushUser.address, 50);

        // Push values to Tellor Playground
        var requestId = 3;
        var mockValue = 300;
        await tellorPlayground.submitValue(requestId, mockValue);

        // Grab value, and push values again
        await expect(tellorPushOracle.pushNewData(requestId, otherTellorPushUser.address)).to.be.revertedWith("The User of Tellor does not have enough tributes!");
    })

    it ("Fail if not enough ether is deposited into the user contract", async function() {
        // Deploy another instance of Tellor Push User
        const OtherTellorPushUser = await ethers.getContractFactory("TellorPushUser");
        otherTellorPushUser = await OtherTellorPushUser.deploy(tellorPushOracle.address, erc20.address);
        await otherTellorPushUser.deployed();
        await erc20.faucet(tellorPushUser.address, 1000);

        // Send ether to oracle and user contracts
        await owner.sendTransaction({
            to: otherTellorPushUser.address,
            value: ethers.utils.parseEther("0.000000000000000001"),
        });

        // Push values to Tellor Playground
        const requestId = 1;
        const mockValue = 3000;
        await tellorPlayground.submitValue(requestId, mockValue);

        // Push data, and get the call back
        await expect(tellorPushOracle.pushNewData(requestId, otherTellorPushUser.address)).to.be.revertedWith("The contract does not have enough ether to pay back the oracle!");
    })
});