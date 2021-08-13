// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/** 
 @author Christopher Pondoc ༼ つ ◕_◕ ༽つ
 @title IERC20
 @dev Interface for standard ERC 20 Token
**/
interface IERC20 {

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);


    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}