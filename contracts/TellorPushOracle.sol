// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "usingtellor/contracts/UsingTellor.sol";
import "./TellorPushUser.sol";

/** 
 @author Christopher Pondoc ༼ つ ◕_◕ ༽つ
 @title TellorPushOracle
 @dev Turns the Tellor oracle into a push oracle by adding functionality
 to push data directly into smart contracts
**/
contract TellorPushOracle is UsingTellor {

    // Functions
    /**
     * @dev Sets up UsingTellor oracle by initializing with address
     * @param _tellorAddress address of Tellor oracle or Tellor Playground instance
     */
    constructor(address payable _tellorAddress) UsingTellor(_tellorAddress) {}

    /**
     * @dev Pushes data to a smart contract using the push oracle mechanism
     * @param _tellorID the ID of the data the oracle pushed
     * @param _userContract the smart contract to push data to -- must be a 
     TellorUser contract
     */
    function pushNewData(uint256 _tellorID, address _userContract) external payable {
        // Grab current value from Tellor oracle and ensure data was retrieved
        (bool ifRetrieve, uint256 value, ) = getCurrentValue(_tellorID);
        require(ifRetrieve == true, "Data was not retrieved!");

        // Pushes data to Tellor user contract using receiveResult function
        TellorPushUser tellorUser = TellorPushUser(_userContract);
        tellorUser.receiveResult(_tellorID, value);
    }

    /**
     * @dev Function to receive Ether. msg.data must be empty
     */
    receive() external payable {}

     /**
     * @dev Fallback function is called when msg.data is not empty
     */
    fallback() external payable {}

    /**
     * @dev Gets the balance of the smart contract
     * @return uint with the amount of ether in the smart contract
     */
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}