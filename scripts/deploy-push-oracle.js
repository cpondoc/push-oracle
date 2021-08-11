// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const { abi, bytecode } = require("usingtellor/artifacts/contracts/TellorPlayground.sol/TellorPlayground.json");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile 
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // Deploy an instance of Tellor Playground
  const TellorPlayground = await ethers.getContractFactory(abi, bytecode);
  const tellorPlayground = await TellorPlayground.deploy();
  await tellorPlayground.deployed();

  // Deploy an instance of Tellor Push Oracle
  const TellorPushOracle = await ethers.getContractFactory("TellorPushOracle");
  const tellorPushOracle = await TellorPushOracle.deploy(tellorPlayground.address);
  await tellorPushOracle.deployed();

  console.log("Tellor Push Oracle deployed to:", tellorPushOracle.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
