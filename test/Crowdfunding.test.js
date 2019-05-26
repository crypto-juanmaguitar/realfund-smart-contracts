/* eslint-disable */
const Crowdfunding = artifacts.require('Crowdfunding')

const DAY = 3600 * 24 * 1000

contract('Crowdfunding', accounts => {
  let crowdfunding
  const _crowdfundingOwner = accounts[0]

  const TITLE = 'test project title'
  const DESCRIPTION = 'test project description'
  const DURATION = 4 * DAY
  const GOAL = 100

  beforeEach(async () => {
    crowdfunding = await Crowdfunding.new()
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
