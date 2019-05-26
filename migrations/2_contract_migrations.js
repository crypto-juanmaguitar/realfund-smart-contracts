const Crowdfunding = artifacts.require('./Crowdfunding.sol')
const TokenSTP = artifacts.require('./TokenSTP.sol')

module.exports = async deployer => {
  await deployer.deploy(Crowdfunding)
  await deployer.deploy(TokenSTP)
}
