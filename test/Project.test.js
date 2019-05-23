/* eslint-disable */
import moment from 'moment'
import { latestTime } from './helpers/time'

const Project = artifacts.require('Project')

// const FINNEY = 10 ** 15
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
  const _goal = 100

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
    const strBalance = await web3.eth.getBalance(projectAddress)
    const balance = parseInt(strBalance,10)
    assert.equal(balance, 0)
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
    assert.equal(goal, _goal)
    assert.equal(finishesAt > _duration, true)
  })

})
