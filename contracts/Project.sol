pragma solidity ^0.5.8;
// pragma solidity >=0.4.21 <0.6.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";


/// @title Crowdfunding
/// @author JuanMa Garrido
/// @notice
/// @dev
contract Project {
    using SafeMath for uint256;
    
    /** DATA STRUCTURES */

    enum State {
        Fundraising,
        Expired,
        Successful
    }

    /** STATE VARIABLES */

    /// project creator
    address payable public creator;

    /// required to reach at least this much, else everyone gets refund
    uint public amountGoal;
    
    /// date when the funding is completed
    uint public closedAt;
    
    /// date when the funding should be completed or everyone gets refund
    uint public raiseBy;

    /// title of the project
    string public title;
    
    /// @state description | description of the project
    string public description;

    /// @state state | state of the project
    State public state = State.Fundraising; // initialize on create

    /// @state contributions | maps that matches addresses and contributions
    mapping (address => uint) public contributions;

    /** EVENTS */

    /// Event that will be emitted whenever funding will be received
    event FundingReceived(address contributor, uint amount, uint currentTotal);
    
    /// Event that will be emitted whenever the project starter has received the funds
    event CreatorPaid(address recipient);


    /** MODIFIERS */

    /// if current state is the one passed as argument
    modifier inState(State _state) {
        require(state == _state);
        _;
    }

    // Modifier to check if the function caller is the project creator
    modifier isNotCreator() {
        require(msg.sender != creator);
        _;
    }

    /** BODY */

    constructor
    (
        address payable projectStarter,
        string memory projectTitle,
        string memory projectDesc,
        uint fundRaisingDeadline,
        uint goalAmount
    ) public {
        creator = projectStarter;
        title = projectTitle;
        description = projectDesc;
        amountGoal = goalAmount;
        raiseBy = fundRaisingDeadline;
    }

    /// @dev Function to fund this project.
    function contribute() external inState(State.Fundraising) isNotCreator payable {
        contributions[msg.sender] = contributions[msg.sender].add(msg.value);
        emit FundingReceived(msg.sender, msg.value, address(this).balance);
        checkIfFundingCompleted();
    }

    /// @dev Check if funding goal has been achieved and set state accordingly
    function checkIfFundingCompleted() public {
        if (address(this).balance >= amountGoal) {
            state = State.Successful;
            closedAt = now;
            payOut();
        }
    }

    /// @dev Check if project has run out of time and set state accordingly
    function checkIfFundingExpired() public {
        if (now > raiseBy) {
            state = State.Expired;
            closedAt = now;
        }
    }

    /// @dev Function to give the received funds to project starter.
    function payOut() internal inState(State.Successful) {
        creator.transfer(address(this).balance);
        emit CreatorPaid(creator);
    }

    /// @dev Function to retrieve donated amount when a project expires.
    function getRefund() public inState(State.Expired) {
        require(contributions[msg.sender] > 0);

        uint amountToRefund = contributions[msg.sender];
        require(amountToRefund > 0);
        contributions[msg.sender] = 0;

        msg.sender.transfer(amountToRefund);
    }
   
    /// @dev Function to get specific information about the project.
    /// @return Returns all the project's details
    function getDetails() public view returns 
    (
        address payable projectStarter,
        string memory projectTitle,
        string memory projectDesc,
        uint256 deadline,
        State currentState,
        uint256 currentBalance,
        uint256 goalAmount
    ) 
    {
        projectStarter = creator;
        projectTitle = title;
        projectDesc = description;
        deadline = raiseBy;
        currentState = state;
        currentBalance = address(this).balance;
        goalAmount = amountGoal;
    }
}