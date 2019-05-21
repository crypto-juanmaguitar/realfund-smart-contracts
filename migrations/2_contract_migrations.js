const Crowdfunding = artifacts.require('./Crowdfunding.sol')

module.exports = async deployer => {
  await deployer.deploy(Crowdfunding)
}
