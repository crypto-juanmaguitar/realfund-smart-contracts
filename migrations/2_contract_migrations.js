const ownableFactory = artifacts.require('Ownable.sol')
const Crowdfunding = artifacts.require('./Crowdfunding.sol')

module.exports = async deployer => {
  await deployer.deploy(ownableFactory)
  await deployer.deploy(Crowdfunding)
}
