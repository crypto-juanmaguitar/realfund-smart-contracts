/* eslint-disable */
const Crowdfunding = artifacts.require('Crowdfunding')

const FINNEY = 10**15;
const DAY = 3600 * 24;

contract('Crowdfunding', accounts => {
  let crowdfunding
  const _crowdfundingOwner = accounts[0]

  const _title = 'test project title'
  const _description = 'test project description'
  const _duration = 4 * DAY
  const _goal = 100

  beforeEach(async () => {
    crowdfunding = await Crowdfunding.new()
  })

  afterEach(async () => {
    crowdfunding = null
  })

  describe('should be able to create projects', () => {
    it(`triggering a 'ProjectStarted' event w/ the proper data`, async () => {
      
      const result = await crowdfunding.startProject(
        _title,
        _description,
        _duration,
        _goal
      )

      assert.equal(result.logs[0].event, 'ProjectStarted')
      assert.equal(result.logs[0].args.title, _title)
      assert.equal(result.logs[0].args.description, _description)
      assert.equal(result.logs[0].args.goal, _goal)
      assert.equal(result.logs[0].args.starter, _crowdfundingOwner)
    })

    it('adding them to a list', async () => {

      const projectsBefore = await crowdfunding.getProjects()
      assert.equal(projectsBefore.length, 0)

      await crowdfunding.startProject(
        _title,
        _description,
        _duration,
        _goal
      )

      const projectsAfter = await crowdfunding.getProjects()
      assert.equal(projectsAfter.length, 1)
    })
  })
})
