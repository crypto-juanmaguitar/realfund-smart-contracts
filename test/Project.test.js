/* eslint-disable */
import moment from 'moment'
import './helpers/_environment'
import { latestTime } from './helpers/time'
import { etherToWei, balanceAddress } from './helpers/wei'

const Project = artifacts.require('Project')

const DAY = 3600 * 24 * 1000

const State = {
  Fundraising: 0,
  Expired: 1,
  Successful: 2
}

contract('Project', accounts => {
  const [firstAccount /*, secondAccount, thirdAccount */] = accounts
  let project

  const _title = 'test project title'
  const _description = 'test project description'
  const _duration = DAY * 4
  const _goal = etherToWei(100)

  beforeEach(async () => {
    project = await Project.new(
      firstAccount,
      _title,
      _description,
      _duration,
      _goal
    )
  })

  afterEach(async () => {
    project = null
  })

  it('should start with a balance of zero', async () => {
    const ZERO_BALANCE = etherToWei(0)
    const projectAddress = await project.address
    const balance = await balanceAddress(projectAddress)
    const balanceInWei = etherToWei(balance)
    assert.equal(balanceInWei.eq(ZERO_BALANCE), true)
  })

  it('should start with a Fundraising State', async () => {
    const currentState = await project.state()
    assert.equal(currentState, State.Fundraising)
  })

  it('should start with no contributions', async () => {
    const contributions = await project.getContributors()
    assert.equal(contributions.length, 0)
  })

  it('should have available the project details', async () => {
    const title = await project.title()
    const description = await project.description()
    const goal = await project.goal()
    const finishesAt = await project.finishesAt()
    
    assert.equal(title, _title)
    assert.equal(description, _description)
    assert.equal(finishesAt > _duration, true)
    assert.equal(goal.eq(_goal), true)
    
    // goal.should.bignumber.equals(_goal);
  })

  xit("should accepts contributions", async () => {
    await funding.donate({ from: firstAccount, value: 10 * FINNEY });
    await funding.donate({ from: secondAccount, value: 20 * FINNEY });
    const balanceSmartContract = web3.eth.getBalance(funding.address).toNumber()
    assert.equal(balanceSmartContract, 30 * FINNEY);
  });

})
