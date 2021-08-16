// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./ITellorPushUser.sol";
import "./ERC20.sol";

/** 
 @author Christopher Pondoc ༼ つ ◕_◕ ༽つ
 @title TellorPushUser
 @dev This contract implements the corresponding interface, which defines the 
 EIP-1154 standard for the consumer (in this case, 'user') of a push oracle.
**/
contract TellorPushUser is ITellorPushUser {

    // Storage
    address approvedOracle; // address of oracle approved to provide data
    uint256 lastRequestId; // last request ID updated by the oracle
    mapping(uint256 => uint256) internalOracle; // mapping of values to grab from
    ERC20 token; // Token to transfer as payment to the oracle

    // Functions
    /**
     * @dev Constructor solely defines the contract address approved to be an oracle
     * @param _oracleAddress address of approved oracle smart contract
     */
    constructor(address _oracleAddress, address _tokenAddress) {
        approvedOracle = _oracleAddress;
        token = ERC20(_tokenAddress);
    }

    /**
     * @dev Allows oracle to push state changes to contract with oracle values
     * @param _requestID the ID of the data the oracle pushed
     * @param _oracleValue the value of the data the oracle pushed
     */
    function receiveResult(uint256 _requestID, uint256 _oracleValue) override external {
        // Require statements per EIP-1154: Oracle Interface 
        require(msg.sender == approvedOracle, "The address is not an approved oracle!");
        require(lastRequestId != _requestID, "This request ID has been called before!");

        // Update last request ID and mapping of values
        lastRequestId = _requestID;
        internalOracle[lastRequestId] = _oracleValue;

        // Check if funds are sufficient, then transfer tokens over
        require(token.balanceOf(address(this)) > 100, "The User of Tellor does not have enough tributes!");
        token.transfer(msg.sender, 100);
    }

    /**
     * @dev Returns value of specific request ID stored by a user of Tellor
     * @param _requestID the ID of the data to be returned
     * @return uint256 the value of the oracle data
     */
    function getUserValue(uint256 _requestID) external view returns (uint256) {
        return internalOracle[_requestID];
    }

    /**
     * @dev Returns balance of the Tellor User contract
     * @return uint256 the number of ERC 20 tokens the specific user has
     */
    function getUserBalance() external view returns(uint256) {
        return token.balanceOf(address(this));
    }
}