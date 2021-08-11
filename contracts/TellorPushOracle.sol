// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "usingtellor/contracts/UsingTellor.sol";
import "./TellorPushUser.sol";
import "hardhat/console.sol";

contract TellorPushOracle is UsingTellor {
    constructor(address payable _tellorAddress) UsingTellor(_tellorAddress) {}

    // Essentially just makes sure that the data is pushed
    function pushNewData(uint256 _tellorID, address userContract) external payable {
        (bool ifRetrieve, uint256 value, ) = getCurrentValue(_tellorID);
        require(ifRetrieve == true, "Data was not retrieved!");
        TellorPushUser tellorUser = TellorPushUser(userContract);
        tellorUser.receiveResult(_tellorID, value);
    }
}