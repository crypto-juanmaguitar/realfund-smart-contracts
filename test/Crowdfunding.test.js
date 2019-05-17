const Crowdfunding = artifacts.require('Crowdfunding')

contract('Crowdfunding', () => {
  let crowdfunding

  beforeEach(async () => {
    crowdfunding = await Crowdfunding.new()
  })

  afterEach(async () => {
    crowdfunding = null
  })

  describe('should be able to create projects', () => {
    it(`triggering a 'ProjectStarted' event`, async () => {
      const title = 'test project title'
      const description = 'test project description'
      const durationInDays = 4
      const amountToRaise = 100

      const result = await crowdfunding.startProject(
        title,
        description,
        durationInDays,
        amountToRaise
      )

      assert.equal(result.logs[0].event, 'ProjectStarted')
      assert.equal(result.logs[0].args.projectTitle, title)
      assert.equal(result.logs[0].args.projectDesc, description)
      assert.equal(result.logs[0].args.goalAmount, amountToRaise)
    })

    it('adding them to a list', async () => {
      const title = 'test project title'
      const description = 'test project description'
      const durationInDays = 4
      const amountToRaise = 100

      const projectsBefore = await crowdfunding.returnAllProjects()
      assert.equal(projectsBefore.length, 0)

      await crowdfunding.startProject(
        title,
        description,
        durationInDays,
        amountToRaise
      )

      const projectsAfter = await crowdfunding.returnAllProjects()
      assert.equal(projectsAfter.length, 1)
    })
  })
})
