// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/** 
 @author Christopher Pondoc ༼ つ ◕_◕ ༽つ
 @title ITellorPushUser
 @dev This interface defines the EIP-1154 standard for the consumer
 (in this case, 'user') of a push oracle.
**/
interface ITellorPushUser {
    /**
     * @dev Allows oracle to push state changes to contract with oracle values
     * @param _requestID the ID of the data the oracle pushed
     * @param _oracleValue the value of the data the oracle pushed
     */
    function receiveResult(uint256 _requestID, uint256 _oracleValue) external;
}