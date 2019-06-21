const Crowdfunding = artifacts.require('./Crowdfunding.sol')
const Project = artifacts.require('./Project.sol')
const TokenSTP = artifacts.require('./TokenSTP.sol')

const NAME = 'RealFund Token Project'
const SYMBOL = 'STP'
const DECIMALS = 18
const RATE = 1

module.exports = async deployer => {
  await deployer.deploy(TokenSTP, NAME, SYMBOL, DECIMALS)
  await deployer.deploy(Crowdfunding, TokenSTP.address, RATE)
}
