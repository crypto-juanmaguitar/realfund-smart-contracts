pragma solidity >=0.4.21 <0.6.0;
// pragma solidity >=0.4.21 <0.6.0;

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

    // addresses Look Up Tables
    address[] private contributionsAddresses;


    /** EVENTS */

    /// Event that will be emitted whenever funding will be received
    event FundingReceived(address contributor, uint amount, uint currentTotal);
    
    /// Event that will be emitted whenever the project starter has received the funds
    event CreatorPaid(address recipient);


    /** MODIFIERS */

    // Modifier to check if the function caller is the project creator
    modifier isCreator() {
        require(msg.sender == creator);
        _;
    }

    // Modifier to check if the function caller is the project creator
    modifier isNotCreator() {
        require(msg.sender != creator);
        _;
    }

    modifier onlyNotFinished() {
        require(!isFinished());
        _;
    }

    modifier onlyFinished() {
        require(isFinished());
        _;
    }

    modifier onlyNotFunded() {
        require(!isFunded());
        _;
    }

    modifier onlyFunded() {
        require(isFunded());
        _;
    }

    /** BODY */

    constructor
    (
        address payable _creator,
        string memory _title,
        string memory _description,
        uint _duration,
        uint _goal
    ) public {
        creator = _creator;
        title = _title;
        description = _description;
        goal = _goal;
        finishesAt = now + _duration;
    }

    /// @dev Function to fund this project.
    function contribute() external onlyNotFinished isNotCreator payable {
        contributions[msg.sender] = contributions[msg.sender].add(msg.value);
        contributionsAddresses.push(msg.sender);
        emit FundingReceived(msg.sender, msg.value, address(this).balance);
        checkIfFundingCompleted();
    }

    /// @dev Check if funding goal has been achieved and set state accordingly
    function checkIfFundingCompleted() public {
        if (address(this).balance >= goal) {
            closedAt = now;
            payOut();
        }
    }

    /// @dev Function to give the received funds to project starter.
    function payOut() internal onlyFunded {
        creator.transfer(address(this).balance);
        emit CreatorPaid(creator);
    }

    /// @dev Function to retrieve donated amount when a project expires.
    function getRefund() public onlyNotFunded onlyFinished {
        require(contributions[msg.sender] > 0);

        uint amountToRefund = contributions[msg.sender];
        require(amountToRefund > 0);
        contributions[msg.sender] = 0;

        msg.sender.transfer(amountToRefund);
    }

    /** @dev Function to get all projects' contract addresses.
      * @return A list of all projects' contract addreses
      */
    function getContributors() external view isCreator returns(address[] memory) {
        return contributionsAddresses;
    }

    function isFinished() public view returns (bool) {
        return finishesAt <= now;
    }

    function isFunded() public view returns (bool) {
        return address(this).balance >= goal;
    }
  
}