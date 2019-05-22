// pragma solidity ^0.5.8;
pragma solidity >=0.4.21 <0.6.0;
// pragma solidity 0.5.4;

// Importing OpenZeppelin's SafeMath Implementation
// import 'https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/math/SafeMath.sol';

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Project.sol";


/// @title Crowdfunding
/// @author JuanMa Garrido
/// @notice
/// @dev
contract Crowdfunding {
    using SafeMath for uint256;

    /** STATE VARIABLES */

    Project[] private projects; // List of existing projects

    /** EVENTS */

    // Event that will be emitted whenever a new project is started
    event ProjectStarted(
        address contractAddress,
        address projectStarter,
        string projectTitle,
        string projectDesc,
        uint256 deadline,
        uint256 goalAmount
    );

    /** BODY */

    /** @dev Function to start a new project.
      * @param _title Title of the project to be created
      * @param _description Brief description about the project
      * @param _duration Project deadline in seconds (to count from now)
      * @param _amountToRaise Project goal in wei
      */
    function startProject(
        string memory _title,
        string memory _description,
        uint _duration,
        uint _amountToRaise
    ) 
        public 
    {
        uint _raiseUntil = now + _duration; // solium-disable-line security/no-block-members
        Project newProject = new Project(msg.sender, _title, _description, _raiseUntil, _amountToRaise);
        projects.push(newProject);
        emit ProjectStarted (
            address(newProject),
            msg.sender,
            _title,
            _description,
            _raiseUntil,
            _amountToRaise
        );
    }                                                                                                                          

    /** @dev Function to get all projects' contract addresses.
      * @return A list of all projects' contract addreses
      */
    function returnAllProjects() external view returns(Project[] memory) {
        return projects;
    }

}

