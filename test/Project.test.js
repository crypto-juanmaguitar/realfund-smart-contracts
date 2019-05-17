// const Project = artifacts.require('Project')

contract('Project', accounts => {
  let project

  beforeEach(async () => {
    const ownerProject = accounts[0]
    // const title = 'test project title'
    // const description = 'test project description'
    // const durationInDays = 4
    // const amountToRaise = 100

    console.log(ownerProject)

    // //cosnt raiseUntil = now.add(durationInDays.mul(1 days));

    // project = await Project.new()
  })

  afterEach(async () => {
    project = null
  })

  it('should assert true', function(done) {
    // const project = Project.deployed()
    console.log(typeof project === 'undefined')
    assert.isTrue(true)
    done()
  })
})
