const { expect } = require("chai");
const { ethers } = require("hardhat");
const { abi, bytecode } = require("usingtellor/artifacts/contracts/TellorPlayground.sol/TellorPlayground.json")

describe("Functionality Tests", function() {
    // Set-up for playground, oracle, and user
    let tellorPlayground;
    let tellorPushOracle;
    let tellorPushUser;
    let erc20;

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