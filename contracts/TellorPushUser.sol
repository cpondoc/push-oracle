// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;

import "./ITellorPushUser.sol";

contract TellorPushUser is ITellorPushUser {

    // Contract variables -- address of oracle, values, etc.
    address approvedOracle;
    uint256 latestOracleValue;
    uint256 latestRequestId;

    // For right now, simply define the oracle address
    constructor(address _oracleAddress) {
        approvedOracle = _oracleAddress;
    }

    // Gets the result to make sure it all works
    function receiveResult(uint256 _requestID, uint256 oracleValue) override external {
        latestOracleValue = oracleValue;
        latestRequestId = _requestID;
    }
}