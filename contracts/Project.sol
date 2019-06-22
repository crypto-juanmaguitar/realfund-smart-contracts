pragma solidity >=0.4.21 <0.6.0;

import "./TokenSTP.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


/// @title Crowdfunding
/// @author JuanMa Garrido
/// @notice
/// @dev
contract Project {
    using SafeMath for uint256;

    uint256 adminPercent = 7;   // Percent of investement for RealFund
    uint256 creatorPercent = 93;   // Percent of investement for RealFund

    /** STATE VARIABLES */

    /// admin → RealFund
    address payable public admin;

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
    uint public openedAt;

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

    event PercentageCalculated(uint amountProject, uint amountCreator, uint amountAdmin);

    /// Event that will be emitted whenever goal is reached
    event ProjectFunded(uint closedAt, uint currentTotal);

    /// Event that will be emitted whenever the project starter has received the funds
    event CreatorPaid(address recipient, uint amount);
    
    /// Event that will be emitted whenever the project starter has received the funds
    event AdminPaid(address recipient, uint amount);


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
        uint256 _rate,
        address payable _admin
    ) 
    public 
    {
        creator = _creator;
        title = _title;
        description = _description;
        goal = _goal;
        openedAt = now;
        finishesAt = now + _duration;
        tokenAddress = _tokenAddress;
        rate = _rate;
        admin = _admin;
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
    function getContributors() external view returns(address[] memory) {
        return contributionsAddresses;
    }

    /** @dev Function to get the number of contributors
      * @return The number of contributors
      */
    function getNumContributors() external view returns(uint256) {
        return contributionsAddresses.length;
    }

    /// @dev Function to give the received funds to project starter.
    function withdrawFunds() public onlyCreator onlyFunded {
        require(address(this).balance >= goal, "current balance should be higher than goal");
        
        uint amountToWithdraw = calculatePercentage(address(this).balance, creatorPercent);
        uint amountComissionAdmin = calculatePercentage(address(this).balance, adminPercent);


        creator.transfer(amountToWithdraw);
        admin.transfer(amountComissionAdmin);

        emit PercentageCalculated(
            address(this).balance, 
            amountToWithdraw, 
            amountComissionAdmin
        );

        emit CreatorPaid(creator, amountToWithdraw);
        emit AdminPaid(admin, amountComissionAdmin);
    }

    /// @dev calculate percentage
    function calculatePercentage(
        uint256 theNumber,
        uint256 percentage
    )
    public pure returns (uint128) 
    {
        return uint128(int256(theNumber) / int256(100) * int256(percentage));
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
    function getTokens() public onlyFunded {
        require(contributions[msg.sender] > 0, "this sender SHOULD HAVE some contributions");

        uint tokensToDistribute = contributions[msg.sender].div(rate);
        require(tokensToDistribute > 0, "there SHOULD BE some amount of tokens to distribute to this sender");

        require(tokensDistribution[msg.sender] == 0, "there SHOULD NOT BE tokens distributed to this account");
        TokenSTP _tokenSTP = TokenSTP(tokenAddress);
        _tokenSTP.mint(msg.sender, tokensToDistribute);
        tokensDistribution[msg.sender] = tokensDistribution[msg.sender].add(tokensToDistribute);

    }

    function isFinished() public view returns (bool) {
        return finishesAt <= now;
    }

    function isFunded() public view returns (bool) {
        return closedAt > 0;
    }

    function tokenSymbol() public view returns (string memory) {
        TokenSTP _tokenSTP = TokenSTP(tokenAddress);
        return _tokenSTP.symbol();
    }

}