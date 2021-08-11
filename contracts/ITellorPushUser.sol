// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface ITellorPushUser {
    function receiveResult(uint256 _requestID, uint256 oracleValue) external;
}