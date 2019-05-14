const Crowdfunding = artifacts.require('Crowdfunding')

contract('Crowdfunding', function() {
  let crowdfunding

  before(async () => {
    crowdfunding = await Crowdfunding.deployed() //deploy contract
  })

  it('should assert true', async done => {
    assert.isTrue(true)
    done()
  })

  describe('should be able to create projects', () => {
    // it("being each one an instance of Project", async () => {
    //   const title = 'test project title'
    //   const description = 'test project description'
    //   const durationInDays = 4
    //   const amountToRaise = 100

    //   await crowdfunding.startProject(title, description, durationInDays, amountToRaise)

    //   const projects = await crowdfunding.returnAllProjects()
    //   console.log(projects)
    //   console.log(project[0])
    //   assert.equal(projectsAfter.length, 1)
    // });

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
