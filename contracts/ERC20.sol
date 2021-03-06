// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/** 
 @author Christopher Pondoc ༼ つ ◕_◕ ༽つ
 @title SafeMath
 @dev This contract implements safe-to-use math functions for deailng with uint256s
**/
library SafeMath {
    // Functions
    /**
     * @dev Internal function for safe addition
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    /**
     * @dev Internal function for safe subtraction, with error
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    /**
     * @dev Internal function for safe subtraction, with error message
     */
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }
}

/** 
 @author Christopher Pondoc ༼ つ ◕_◕ ༽つ
 @title ERC20
 @dev This contract implements the corresponding smart contract for an ERC20 token
**/
contract ERC20 {

    using SafeMath for uint256; // For SafeMath

    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // Storage
    mapping (address => uint256) private _balances; // Mapping of the balance of each smart contract address
    mapping (address => mapping (address => uint256)) private _allowances; // Mapping of allowances

    uint256 private _totalSupply; // Total number of tokens
    string private _name; // Name of token
    string private _symbol; // Symbol of token
    uint8 private _decimals; // Number of decimals in representation

    // Functions
    /**
     * @dev Constructor defines name, symbol, and decimal specification of token
     */
    constructor (string memory tokenName, string memory tokenSymbol) {
        _name = tokenName;
        _symbol = tokenSymbol;
        _decimals = 18;
    }

      /**
     * @dev Public function to mint tokens for the passed address
     * @param user The address which will own the tokens
     *
     */
    function faucet(address user, uint256 _mintAmount) external {
        _mint(user, _mintAmount);
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token.
     */
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5,05` (`505 / 10 ** 2`).
     *
     * Tokens usually opt for a value of 18, imitating the relationship between
     * Ether and Wei. This is the value {ERC20} uses, unless {_setupDecimals} is
     * called.
     *
     * NOTE: This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract.
     */
    function decimals() public view returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Returns the total supply of the token.
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev Returns the balance of a given user.
     */
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev Transfer tokens from user to another
     * @param recipient The destination address
     * @param amount The amount of tokens, including decimals, to transfer
     * @return bool If the transfer succeeded
     *
     */
    function transfer(address recipient, uint256 amount) public virtual returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }


     /**
     * @dev Retruns the amount that an address is alowed to spend of behalf of other
     * @param owner The address which owns the tokens
     * @param spender The address that will use the tokens
     * @return uint256 Indicating the amount of allowed tokens
     *
     */
    function allowance(address owner, address spender) public view virtual returns (uint256) {
        return _allowances[owner][spender];
    }


     /**
     * @dev Approves  amount that an address is alowed to spend of behalf of other
     * @param spender The address which user the tokens
     * @param amount The amount that msg.sender is allowing spender to use
     * @return bool If the transaction succeeded
     *
     */
    function approve(address spender, uint256 amount) public virtual returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    /**
     * @dev Internal function to perform token transfer
     */
    function _transfer(address sender, address recipient, uint256 amount) internal virtual {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        _balances[sender] = _balances[sender].sub(amount, "ERC20: transfer amount exceeds balance");
        _balances[recipient] = _balances[recipient].add(amount);
        emit Transfer(sender, recipient, amount);
    }

    /**
     * @dev Internal function to create new tokens for the user
     */
    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _totalSupply = _totalSupply.add(amount);
        _balances[account] = _balances[account].add(amount);
        emit Transfer(address(0), account, amount);
    }

    /**
     * @dev Internal function to burn tokens for the user
     */
    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");

        _balances[account] = _balances[account].sub(amount, "ERC20: burn amount exceeds balance");
        _totalSupply = _totalSupply.sub(amount);
        emit Transfer(account, address(0), amount);
    }

    /**
     * @dev Internal function to approve tokens for the user
     */
    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
}