const Crowdfunding = artifacts.require('./Crowdfunding.sol')
const Project = artifacts.require('./Project.sol')
const TokenSTP = artifacts.require('./TokenSTP.sol')

module.exports = async deployer => {
  await deployer.deploy(TokenSTP)
  await deployer.deploy(Crowdfunding, TokenSTP.address)
}
