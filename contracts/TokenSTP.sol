pragma solidity >=0.4.21 <0.6.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Pausable.sol";

/**
 * @title RealFund Token Project
 * @author JuanMa Garrido
 *
 * @dev ERC20 RealFund Token Project (STP)
 * Meant to be a STO in following steps
 */


contract TokenSTP is ERC20Mintable, ERC20Pausable, ERC20Detailed {
    /* solium-disable no-empty-blocks */
    constructor(string memory _name, string memory _symbol, uint8 _decimals)
        ERC20Detailed(_name, _symbol, _decimals)
        public
    {

    }
}