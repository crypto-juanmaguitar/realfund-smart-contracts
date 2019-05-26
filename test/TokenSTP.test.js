//import { etherToWei, weiToEher, balanceAddressInEther } from './helpers/wei'

const TokenSTP = artifacts.require('TokenSTP.sol')

contract('TokenProjectRealFund', accounts => {
  let token

  beforeEach(async () => {
    token = await TokenSTP.new()
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
})
