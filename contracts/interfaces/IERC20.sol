// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/** 
 @author Christopher Pondoc ༼ つ ◕_◕ ༽つ
 @title IERC20
 @dev This contract implements the corresponding interface for an ERC20 token
**/
interface IERC20 {
    // Functions
    /**
     * @dev Transfers tokens from one address to another
     * @param _to the address of the smart contract the caller is sending an amount to
     * @param _amount the amount of tokens being sent to the other user
     * @return bool whether or not transfer was successful
     */
    function transfer(address _to, uint256 _amount) external returns (bool);

    /**
     * @dev Returns the balance of a given user.
     * @param _addy address to inspect
     * @return uint256 balance of the address
     */
    function balanceOf(address _addy) external returns (uint256);
}