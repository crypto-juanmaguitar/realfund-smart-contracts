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
    uint public goal;
    
    /// date when the funding is completed
    uint public closedAt;
    
    /// date when the funding should be completed or everyone gets refund
    uint public finishesAt;

    /// title of the project
    string public title;
    
    /// description of the project
    string public description;

    /// state of the project
    State public state = State.Fundraising; // initialize on create

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

    /// if current state is the one passed as argument
    modifier onlyInState(State _state) {
        require(state == _state);
        _;
    }

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
    function contribute() external onlyInState(State.Fundraising) isNotCreator payable {
        contributions[msg.sender] = contributions[msg.sender].add(msg.value);
        contributionsAddresses.push(msg.sender);
        emit FundingReceived(msg.sender, msg.value, address(this).balance);
        checkIfFundingCompleted();
    }

    /// @dev Check if funding goal has been achieved and set state accordingly
    function checkIfFundingCompleted() public {
        if (address(this).balance >= goal) {
            state = State.Successful;
            closedAt = now;
            payOut();
        }
    }

    /// @dev Check if project has run out of time and set state accordingly
    function checkIfFundingExpired() public {
        if (now > finishesAt) {
            state = State.Expired;
            closedAt = now;
        }
    }

    /// @dev Function to give the received funds to project starter.
    function payOut() internal onlyInState(State.Successful) {
        creator.transfer(address(this).balance);
        emit CreatorPaid(creator);
    }

    /// @dev Function to retrieve donated amount when a project expires.
    function getRefund() public onlyInState(State.Expired) {
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
  
}