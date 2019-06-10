const Crowdfunding = artifacts.require('./Crowdfunding.sol')
const Project = artifacts.require('./Project.sol')
const TokenSTP = artifacts.require('./TokenSTP.sol')

const NAME = "RealFund Token Project";
const SYMBOL = "STP";
const DECIMALS = 18;
const RATE = web3.utils.toBN(web3.utils.toWei('1', 'ether'))

module.exports = async deployer => {
  await deployer.deploy(TokenSTP, NAME, SYMBOL, DECIMALS)
  await deployer.deploy(Crowdfunding, TokenSTP.address, RATE)
}
