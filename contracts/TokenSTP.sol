pragma solidity >=0.4.21 <0.6.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";

/**
 * @title RealFund Token Project
 * @author JuanMa Garrido
 *
 * @dev ERC20 RealFund Token Project (STP)
 * Meant to be a STO in following steps
 */


contract TokenSTP is ERC20Mintable {
    string public name = "RealFund Token Project";
    string public symbol = "STP";
    uint8 public decimals = 18;
}