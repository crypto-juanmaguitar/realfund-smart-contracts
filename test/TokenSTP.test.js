//import { etherToWei, weiToEher, balanceAddressInEther } from './helpers/wei'

const TokenSTP = artifacts.require('TokenSTP.sol')

const NAME = 'RealFund Token Project'
const SYMBOL = 'STP'
const DECIMALS = 18

contract('TokenProjectRealFund', accounts => {
  let token

  const creatorAccount = accounts[0]

  console.log('---TOKEN---')
  console.log({ creatorAccount })

  beforeEach(async () => {
    token = await TokenSTP.new(NAME, SYMBOL, DECIMALS)
  })

  it('should start with a totalSupply of 0', async () => {
    const totalSupply = await token.totalSupply()
    assert.equal(totalSupply.toNumber(), 0)
  })

  it('should mint a given amount of tokens to a given address', async () => {
    const result = await token.mint(accounts[0], 100)

    assert.equal(result.logs[0].event, 'Transfer')
    assert.equal(result.logs[0].args.from.valueOf(), 0x0)
    assert.equal(result.logs[0].args.to, accounts[0])
    assert.equal(result.logs[0].args.value.toNumber(), 100)

    const balance0 = await token.balanceOf(accounts[0])
    assert.equal(balance0.toNumber(), 100)

    const totalSupply = await token.totalSupply()
    assert.equal(totalSupply.toNumber(), 100)
  })

  it('should mint a given amount of tokens to a given address', async () => {
    const result = await token.mint(creatorAccount, 100)

    assert.equal(result.logs[0].event, 'Transfer')
    assert.equal(result.logs[0].args.from.valueOf(), 0x0)
    assert.equal(result.logs[0].args.to, creatorAccount)
    assert.equal(result.logs[0].args.value.toNumber(), 100)

    const balance0 = await token.balanceOf(creatorAccount)
    assert.equal(balance0.toNumber(), 100)

    const totalSupply = await token.totalSupply()
    assert.equal(totalSupply.toNumber(), 100)
  })
})
