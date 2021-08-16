const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi, bytecode } = require("usingtellor/artifacts/contracts/TellorPlayground.sol/TellorPlayground.json")

describe("TellorPush User Transfer Tests", function() {
    // Set-up for playground, oracle, user, and starting gas
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

    // Simple e2e test -- ensuring funds are distributed correctly
    it ("Make sure both contracts have correct amount of funds after one push", async function() {
        // Push values to Tellor Playground
        var requestId = 3;
        var mockValue = 300;
        await tellorPlayground.submitValue(requestId, mockValue);

        // Push data, and check funds
        await tellorPushOracle.pushNewData(requestId, tellorPushUser.address);
        expect(await erc20.balanceOf(tellorPushUser.address)).to.equal(900);
        expect(await erc20.balanceOf(tellorPushOracle.address)).to.equal(1100);

        // Check that gas checks out
        const userGas = BigNumber.from(await tellorPushUser.getEtherBalance());
        const oracleGas = BigNumber.from(await tellorPushOracle.getEtherBalance());
        expect(parseFloat(ethers.utils.formatUnits(userGas))).to.be.lessThan(startingGas);
        expect(parseFloat(ethers.utils.formatUnits(oracleGas))).to.be.greaterThan(startingGas);
    })

    // More complex test -- making sure entire workflow is tested through
    it ("Make sure both contracts have correct ammount of funds after multiple pushes", async function() {
        // Push values to Tellor Playground
        var requestId = 3;
        var mockValue = 300;
        await tellorPlayground.submitValue(requestId, mockValue);

        // Push data, and check funds
        await tellorPushOracle.pushNewData(requestId, tellorPushUser.address);
        expect(await erc20.balanceOf(tellorPushUser.address)).to.equal(900);
        expect(await erc20.balanceOf(tellorPushOracle.address)).to.equal(1100);

        // Push new values to Tellor Playground
        requestId = 5;
        mockValue = 600;
        await tellorPlayground.submitValue(requestId, mockValue);
        await tellorPushOracle.pushNewData(requestId, tellorPushUser.address);

        requestId = 10;
        mockValue = 300;
        await tellorPlayground.submitValue(requestId, mockValue);
        await tellorPushOracle.pushNewData(requestId, tellorPushUser.address);

        // Check funds
        expect(await erc20.balanceOf(tellorPushUser.address)).to.equal(700);
        expect(await erc20.balanceOf(tellorPushOracle.address)).to.equal(1300);  

        // Check that gas checks out
        const userGas = BigNumber.from(await tellorPushUser.getEtherBalance());
        const oracleGas = BigNumber.from(await tellorPushOracle.getEtherBalance());
        expect(parseFloat(ethers.utils.formatUnits(userGas))).to.be.lessThan(startingGas);
        expect(parseFloat(ethers.utils.formatUnits(oracleGas))).to.be.greaterThan(startingGas);
    })

});