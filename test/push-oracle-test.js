const { expect } = require("chai");
const { ethers } = require("hardhat");
const { abi, bytecode } = require("usingtellor/artifacts/contracts/TellorPlayground.sol/TellorPlayground.json")

describe("Tellor Push Oracle", function() {
    it("Test Functionality", async function() {
        // Deploy an instance of Tellor Playground
        const TellorPlayground = await ethers.getContractFactory(abi, bytecode);
        const tellorPlayground = await TellorPlayground.deploy();
        await tellorPlayground.deployed();

        // Deploy an instance of Tellor Push Oracle
        const TellorPushOracle = await ethers.getContractFactory("TellorPushOracle");
        const tellorPushOracle = await TellorPushOracle.deploy(tellorPlayground.address);
        await tellorPushOracle.deployed();

        // Push values to Tellor Playground
        const requestId = 1;
        const mockValue = "7000000";
        await tellorPlayground.submitValue(requestId, mockValue);

        // Call initial function to check for receiveResult
        await tellorPushOracle.pushNewData(1, tellorPlayground.address);
    });
  });
  