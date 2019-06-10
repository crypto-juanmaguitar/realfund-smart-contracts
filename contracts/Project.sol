pragma solidity >=0.4.21 <0.6.0;

import "./TokenSTP.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


/// @title Crowdfunding
/// @author JuanMa Garrido
/// @notice
/// @dev
contract Project {
    using SafeMath for uint256;

    /** STATE VARIABLES */

    /// project creator
    address payable public creator;

    /// token address
    address tokenAddress;

    /// token rate
    uint256 rate;

    /// required to reach at least this much, else everyone gets refund
    uint public goal;

    /// date when the funding is completed
    uint public closedAt;

    /// date when the funding should be completed or everyone gets refund
    uint public finishesAt;

    /// title of the project
    string public title;

    /// description of the project
    string public description;

    /// maps that matches addresses and contributions
    mapping (address => uint) public contributions;

    /// maps that matches addresses and contributions
    mapping (address => uint) public tokensDistribution;

    // addresses Look Up Tables
    address[] private contributionsAddresses;


    /** EVENTS */

    /// Event that will be emitted whenever funding will be received
    event FundingReceived(address contributor, uint amount, uint currentTotal);

    /// Event that will be emitted whenever goal is reached
    event ProjectFunded(uint closedAt, uint currentTotal);

    /// Event that will be emitted whenever the project starter has received the funds
    event CreatorPaid(address recipient);


    /** MODIFIERS */

    // Modifier to check if the function caller is the project creator
    modifier onlyCreator() {
        require(msg.sender == creator, "current sender SHOULD BE the creator");
        _;
    }

    // Modifier to check if the function caller is the project creator
    modifier onlyNotCreator() {
        require(msg.sender != creator, "current sender SHOULD NOT BE the creator");
        _;
    }

    modifier onlyNotFinished() {
        require(!isFinished(), "current date SHOULD BE BEFORE -finishesAt- time");
        _;
    }

    modifier onlyFinished() {
        require(isFinished(), "current date SHOULD BE AFTER -finishesAt- time");
        _;
    }

    modifier onlyNotFunded() {
        require(!isFunded(), "project SHOULD NOT BE funded");
        _;
    }

    modifier onlyFunded() {
        require(isFunded(), "project SHOULD HAVE BEEN funded");
        _;
    }

    /** BODY */

    constructor
    (
        address payable _creator,
        string memory _title,
        string memory _description,
        uint _duration,
        uint _goal,
        address _tokenAddress,
        uint256 _rate
    ) 
    public 
    {
        creator = _creator;
        title = _title;
        description = _description;
        goal = _goal;
        finishesAt = now + _duration;
        tokenAddress = _tokenAddress;
        rate = _rate;
    }

    /// @dev Function to fund this project.
    function contribute() external onlyNotFinished onlyNotCreator payable {
        contributions[msg.sender] = contributions[msg.sender].add(msg.value);
        contributionsAddresses.push(msg.sender);
        emit FundingReceived(msg.sender, msg.value, address(this).balance);
        if (address(this).balance >= goal) {
            closedAt = now;
            emit ProjectFunded(closedAt, address(this).balance);
        }
    }

    /** @dev Function to get all projects' contract addresses.
      * @return A list of all projects' contract addreses
      */
    function getContributors() external view onlyCreator returns(address[] memory) {
        return contributionsAddresses;
    }

    /// @dev Function to give the received funds to project starter.
    function withdrawFunds() public onlyCreator onlyFunded {
        creator.transfer(address(this).balance);
        emit CreatorPaid(creator);
    }

    /// @dev Function to retrieve donated amount when a project expires.
    function getRefund() public onlyNotFunded onlyFinished {
        require(contributions[msg.sender] > 0, "this sender SHOULD HAVE some contributions");

        uint amountToRefund = contributions[msg.sender];
        require(amountToRefund > 0, "there SHOULD BE some amount to refund to this sender");
        contributions[msg.sender] = 0;

        msg.sender.transfer(amountToRefund);
    }

    /// @dev Function to retrieve tokens representing the contribution
    function getTokens(address targetTokens) public onlyCreator onlyFunded onlyFinished {
        require(contributions[targetTokens] > 0, "this sender SHOULD HAVE some contributions");

        uint tokensToDistribute = contributions[targetTokens].div(rate);
        require(tokensToDistribute > 0, "there SHOULD BE some amount of tokens to distribute to this sender");

        TokenSTP _tokenSTP = TokenSTP(tokenAddress);
        _tokenSTP.mint(targetTokens, tokensToDistribute);
    }

    function isFinished() public view returns (bool) {
        return finishesAt <= now;
    }

    function isFunded() public view returns (bool) {
        return address(this).balance >= goal;
    }

    function tokenSymbol() public view returns (string memory) {
        TokenSTP _tokenSTP = TokenSTP(tokenAddress);
        return _tokenSTP.symbol();
    }

}