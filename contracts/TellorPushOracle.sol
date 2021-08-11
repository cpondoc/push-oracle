
// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;

import "usingtellor/contracts/UsingTellor.sol";

contract SampleUsingTellor is UsingTellor {
    constructor(address payable _tellorAddress) UsingTellor(_tellorAddress) {}

    function pushNewData(uint256 _tellorID, address userContract) external view {
        (bool ifRetrieve, uint256 value, ) = getCurrentValue(_tellorID);
        require(ifRetrieve == true, "Data was not retrieved!");
        // Include logic about making sure to cast to an ITellorUser, and then converting
    }

}