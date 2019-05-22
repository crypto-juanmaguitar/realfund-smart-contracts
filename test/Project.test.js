/* eslint-disable */
const Project = artifacts.require('Project')

// const FINNEY = 10 ** 15
const DAY = 3600 * 24

contract('Project', accounts => {
  const [firstAccount /*, secondAccount, thirdAccount */] = accounts
  let project

  const title = 'test project title'
  const description = 'test project description'
  const duration = Date.now()  + DAY * 4
  const amount = 100

  beforeEach(async () => {

    project = await Project.new(
      firstAccount,
      title,
      description,
      duration,
      amount
    )

  })

  afterEach(async () => {
    project = null
  })

  it('should retutn the project details', async () => {
    const projectDetails = await project.getDetails()
    const {
      projectStarter,
      projectTitle,
      projectDesc,
      deadline,
      currentState,
      currentBalance,
      goalAmount
    } = projectDetails

    assert.equal(projectTitle, title)
    assert.equal(projectDesc, description)
  })

  // beforeEach(async () => {
  //   const ownerProject = accounts[0]
  //   // const title = 'test project title'
  //   // const description = 'test project description'
  //   // const durationInDays = 4
  //   // const amountToRaise = 100

  //   console.log(ownerProject)

  //   // //cosnt raiseUntil = now.add(durationInDays.mul(1 days));

  //   // project = await Project.new()
  // })

  // afterEach(async () => {
  //   project = null
  // })

  // it('should assert true', function(done) {
  //   // const project = Project.deployed()
  //   console.log(typeof project === 'undefined')
  //   assert.isTrue(true)
  //   done()
  // })
})
