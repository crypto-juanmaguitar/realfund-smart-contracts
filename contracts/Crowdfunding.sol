pragma solidity ^0.5.8;
// pragma solidity >=0.4.21 <0.6.0;
// pragma solidity 0.5.4;

// Importing OpenZeppelin's SafeMath Implementation
// import 'https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/math/SafeMath.sol';

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Project.sol";


contract Crowdfunding {
    using SafeMath for uint256;

    Project[] private projects; // List of existing projects

    // Event that will be emitted whenever a new project is started
    event ProjectStarted(
        address contractAddress,
        address projectStarter,
        string projectTitle,
        string projectDesc,
        uint256 deadline,
        uint256 goalAmount
    );

    /** @dev Function to start a new project.
      * @param title Title of the project to be created
      * @param description Brief description about the project
      * @param durationInDays Project deadline in days
      * @param amountToRaise Project goal in wei
      */
    function startProject(
        string memory title,
        string memory description,
        uint durationInDays,
        uint amountToRaise
    ) 
        public 
    {
        uint raiseUntil = now.add(durationInDays.mul(1 days)); // solium-disable-line security/no-block-members
        Project newProject = new Project(msg.sender, title, description, raiseUntil, amountToRaise);
        projects.push(newProject);
        emit ProjectStarted (
            address(newProject),
            msg.sender,
            title,
            description,
            raiseUntil,
            amountToRaise
        );
    }                                                                                                                                   

    /** @dev Function to get all projects' contract addresses.
      * @return A list of all projects' contract addreses
      */
    function returnAllProjects() external view returns(Project[] memory) {
        return projects;
    }

}
