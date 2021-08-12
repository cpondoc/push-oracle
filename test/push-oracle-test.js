const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");
const { abi, bytecode } = require("usingtellor/artifacts/contracts/TellorPlayground.sol/TellorPlayground.json")

describe("Functionality Tests", function() {
    // Set-up for playground, oracle, and user
    let tellorPlayground;
    let tellorPushOracle;
    let tellorPushUser;

    beforeEach(async function() {
        // Deploy an instance of Tellor Playground
        const TellorPlayground = await ethers.getContractFactory(abi, bytecode);
        tellorPlayground = await TellorPlayground.deploy();
        await tellorPlayground.deployed();

        // Deploy an instance of Tellor Push Oracle
        const TellorPushOracle = await ethers.getContractFactory("TellorPushOracle");
        tellorPushOracle = await TellorPushOracle.deploy(tellorPlayground.address);
        await tellorPushOracle.deployed();

        // Deploy an instance of Tellor Push User
        const TellorPushUser = await ethers.getContractFactory("TellorPushUser");
        tellorPushUser = await TellorPushUser.deploy(tellorPushOracle.address);
        await tellorPushUser.deployed();
    });

    // Test Example - data ID = 1, value = 3000
    it ("Correctly matches up with data ID 1, value of 3000", async function() {
        // Push values to Tellor Playground
        const requestId = 1;
        const mockValue = 3000;
        await tellorPlayground.submitValue(requestId, mockValue);

        // Push data, and get the call back
        await tellorPushOracle.pushNewData(requestId, tellorPushUser.address);
        const oracleVal = await tellorPushUser.getUserValue(requestId);
        expect(oracleVal).to.equal(mockValue)
    });

    // Test Example - data ID 3, value = 300
    it ("Correctly matches up with data ID 3, value of 300", async function() {
        // Push values to Tellor Playground
        const requestId = 3;
        const mockValue = 300;
        await tellorPlayground.submitValue(requestId, mockValue);

        // Push data, and get the call back
        await tellorPushOracle.pushNewData(requestId, tellorPushUser.address);
        const oracleVal = await tellorPushUser.getUserValue(requestId);
        expect(oracleVal).to.equal(mockValue)
    });

});

describe("TellorPush User Require Tests", function() {
    // Set-up for playground, oracle, and user
    let tellorPlayground;
    let tellorPushOracle;
    let tellorPushUser;

    beforeEach(async function() {
        // Deploy an instance of Tellor Playground
        const TellorPlayground = await ethers.getContractFactory(abi, bytecode);
        tellorPlayground = await TellorPlayground.deploy();
        await tellorPlayground.deployed();

        // Deploy an instance of Tellor Push Oracle
        const TellorPushOracle = await ethers.getContractFactory("TellorPushOracle");
        tellorPushOracle = await TellorPushOracle.deploy(tellorPlayground.address);
        await tellorPushOracle.deployed();

        // Deploy an instance of Tellor Push User
        const TellorPushUser = await ethers.getContractFactory("TellorPushUser");
        tellorPushUser = await TellorPushUser.deploy(tellorPushOracle.address);
        await tellorPushUser.deployed();
    });

    // receiveResult does not take a non-approved contract address
    it ("Fail if receiveResult takes a non-approved contract address", async function() {
        // Direct call to receiveResult with non oracle address
        await expect(tellorPushUser.receiveResult(1, 20)).to.be.revertedWith("The address is not an approved oracle!");
    });

    // receiveResult does not take a non-approved oracle address
    it ("Fail if receiveResult takes a non-approved oracle address", async function() {
        // Push values to Tellor Playground
        const requestId = 1;
        const mockValue = 300;
        await tellorPlayground.submitValue(requestId, mockValue);

        // Deploy a separate instance of Tellor Push Oracle
        const OtherTellorPushOracle = await ethers.getContractFactory("TellorPushOracle");
        otherTellorPushOracle = await OtherTellorPushOracle.deploy(tellorPlayground.address);
        await otherTellorPushOracle.deployed();

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
});