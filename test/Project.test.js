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

let counter = 0

contract('Project', accounts => {
  const [firstAccount, secondAccount, thirdAccount, forthAccount, fifthAccount] = accounts
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
    const projectAddress = await project.address
    const balance = await balanceAddress(projectAddress)
    const balanceInEther = web3.utils.fromWei(balance, 'ether')
    assert.equal(balanceInEther, 0)
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
  })

  it('should accepts contributions', async () => {
    await project.contribute({ from: secondAccount, value: etherToWei(10) })
    await project.contribute({ from: thirdAccount, value: etherToWei(10) })
    const balance = await balanceAddress(project.address)
    const balanceInEther = web3.utils.fromWei(balance, 'ether')
    assert.equal(balanceInEther, 30)
  })

  it('should keeps track of contributor balance', async () => {
    
    await project.contribute({ from: secondAccount, value: etherToWei(10) })
    await project.contribute({ from: thirdAccount, value: etherToWei(20) })
    await project.contribute({ from: secondAccount, value: etherToWei(30) })

    const balanceSecondAccount = await project.contributions.call(secondAccount)
    const balanceThirdAccount = await project.contributions.call(thirdAccount)
    const balanceSecondAccountInEther = web3.utils.fromWei(
      balanceSecondAccount,
      'ether'
    )
    const balanceThirdAccountInEther = web3.utils.fromWei(
      balanceThirdAccount,
      'ether'
    )
    assert.equal(balanceSecondAccountInEther, 40)
    assert.equal(balanceThirdAccountInEther, 20)
  })
})
