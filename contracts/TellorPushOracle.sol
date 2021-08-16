// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "usingtellor/contracts/UsingTellor.sol";
import "./TellorPushUser.sol";
import "./ERC20.sol";

/** 
 @author Christopher Pondoc ༼ つ ◕_◕ ༽つ
 @title TellorPushOracle
 @dev Turns the Tellor oracle into a push oracle by adding functionality
 to push data directly into smart contracts
**/
contract TellorPushOracle is UsingTellor {

    using SafeMath for uint256;

    // Storage
    ERC20 token; // Token to transfer as payment to the oracle

    // Functions
    /**
     * @dev Sets up UsingTellor oracle by initializing with address and defines
     address of ERC20 token used
     * @param _tellorAddress address of Tellor oracle or Tellor Playground instance
     */
    constructor(address payable _tellorAddress, address _tokenAddress) UsingTellor(_tellorAddress) {
        token = ERC20(_tokenAddress);
    }

    /**
     * @dev Pushes data to a smart contract using the push oracle mechanism
     * @param _tellorID the ID of the data the oracle pushed
     * @param _userContract the smart contract to push data to -- must be a 
     TellorUser contract
     */
    function pushNewData(uint256 _tellorID, address payable _userContract) external payable {
        uint256 initialGas = gasleft(); // Get initial gas

        // Grab current value from Tellor oracle and ensure data was retrieved
        (bool ifRetrieve, uint256 value, ) = getCurrentValue(_tellorID);
        require(ifRetrieve == true, "Data was not retrieved!");

        uint256 gasDifference = initialGas.sub(gasleft()); // Calculate difference in gas

        // Pushes data to Tellor user contract using receiveResult function
        TellorPushUser tellorUser = TellorPushUser(_userContract);
        tellorUser.receiveResult(_tellorID, value, gasDifference);
    }

    /**
     * @dev Returns amount of ether the smart contract holds
     */
    function getEtherBalance() public view returns (uint) {
        return address(this).balance;
    }

    /**
     * @dev Function to receive Ether. msg.data must be empty
     */
    receive() external payable {}

    /**
     * @dev Fallback function is called when msg.data is not empty
     */
    fallback() external payable {}
}