/* eslint-disable */
const Crowdfunding = artifacts.require('Crowdfunding')
const TokenSTP = artifacts.require('TokenSTP')

const DAY = 3600 * 24 * 1000

contract('Crowdfunding', accounts => {
  let crowdfunding, tokenInstance
  const _crowdfundingOwner = accounts[0]

  const TITLE = 'test project title'
  const DESCRIPTION = 'test project description'
  const DURATION = 4 * DAY
  const GOAL = 100
  const RATE = web3.utils.toBN(web3.utils.toWei('1', 'ether'))

  beforeEach(async () => {
    tokenInstance = await TokenSTP.deployed()
    crowdfunding = await Crowdfunding.new(tokenInstance.address, RATE)
  })

  afterEach(async () => {
    crowdfunding = null
  })

  it(`creates projects`, async () => {
    const result = await crowdfunding.startProject(
      TITLE,
      DESCRIPTION,
      DURATION,
      GOAL
    )

    assert.equal(result.logs[0].event, 'ProjectStarted')
    assert.equal(result.logs[0].args.title, TITLE)
    assert.equal(result.logs[0].args.description, DESCRIPTION)
    assert.equal(result.logs[0].args.goal, GOAL)
    assert.equal(result.logs[0].args.starter, _crowdfundingOwner)
  })

  it(`add them to a list`, async () => {
    const projectsBefore = await crowdfunding.getProjects()
    assert.equal(projectsBefore.length, 0)

    await crowdfunding.startProject(TITLE, DESCRIPTION, DURATION, GOAL)

    const projectsAfter = await crowdfunding.getProjects()
    assert.equal(projectsAfter.length, 1)
  })
})
