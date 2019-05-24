/* eslint-disable */
import './helpers/_environment'
import { increaseTime } from './helpers/time'
import { etherToWei, balanceAddress } from './helpers/wei'

const Project = artifacts.require('Project')

const DAY = 3600 * 24 * 1000

contract('Project', accounts => {
  let project

  const creatorAccount = accounts[0]
  const _title = 'test project title'
  const _description = 'test project description'
  const _duration = DAY * 4
  const _goal = 100

  beforeEach(async () => {
    project = await Project.new(
      creatorAccount,
      _title,
      _description,
      _duration,
      etherToWei(_goal)
    )
  })

  afterEach(async () => {
    project = null
  })

  it('starts with a balance of zero', async () => {
    const projectAddress = await project.address
    const balance = await balanceAddress(projectAddress)
    const balanceInEther = web3.utils.fromWei(balance)
    assert.equal(balanceInEther, 0)
  })

  it('starts not being finished and not being funded', async () => {
    const isFinished = await project.isFinished()
    const isFunded = await project.isFunded()
    assert.isTrue(!isFinished)
    assert.isTrue(!isFunded)
  })

  it('starts with no contributions', async () => {
    const contributions = await project.getContributors()
    assert.equal(contributions.length, 0)
  })

  it('has available the project details', async () => {
    const title = await project.title()
    const description = await project.description()
    const goal = await project.goal()
    const finishesAt = await project.finishesAt()

    assert.equal(title, _title)
    assert.equal(description, _description)
    assert.equal(finishesAt > _duration, true)
    assert.isTrue(goal.eq(etherToWei(_goal)))
  })

  it('accepts contributions', async () => {
    const account10 = accounts[10]
    const account11 = accounts[11]

    const balanceProject = await balanceAddress(project.address)
    const balanceProjectInEther = web3.utils.fromWei(balanceProject)
    assert.equal(balanceProjectInEther, 0)

    await project.contribute({ from: account10, value: etherToWei(10) })
    await project.contribute({ from: account11, value: etherToWei(20) })

    const balance = await balanceAddress(project.address)
    const balanceInEther = web3.utils.fromWei(balance)
    assert.equal(balanceInEther, 30)
  })

  it('keeps track of contributor balance', async () => {
    const account12 = accounts[12]
    const account13 = accounts[13]

    const balanceProject = await balanceAddress(project.address)
    const balanceProjectInEther = web3.utils.fromWei(balanceProject)
    assert.equal(balanceProjectInEther, 0)

    await project.contribute({ from: account12, value: etherToWei(10) })
    await project.contribute({ from: account13, value: etherToWei(20) })
    await project.contribute({ from: account12, value: etherToWei(30) })

    const balanceAccount12 = await project.contributions.call(account12)
    const balanceAccount13 = await project.contributions.call(account13)
    const balanceAccount12InEther = web3.utils.fromWei(balanceAccount12)
    const balanceAccount13InEther = web3.utils.fromWei(balanceAccount13)
    assert.equal(balanceAccount12InEther, 40)
    assert.equal(balanceAccount13InEther, 20)
  })

  it('does not allow for donations when time is up', async () => {
    const account14 = accounts[14]
    const account15 = accounts[15]

    await project.contribute({ from: account14, value: etherToWei(10) })
    await increaseTime(DAY * 5)
    try {
      await project.contribute({ from: account15, value: etherToWei(30) })
      assert.fail()
    } catch (err) {
      assert.ok(/revert/.test(err.message))
    }

    const balanceProject = await balanceAddress(project.address)
    const balanceProjectInEther = web3.utils.fromWei(balanceProject)
    assert.equal(balanceProjectInEther, 10)
  })

  it('allows creator to withdraw funds when goal is reached', async () => {
    const account16 = accounts[16]
    const account17 = accounts[17]

    const initProjectBalance = await balanceAddress(project.address)
    const initProjectBalanceInEther = web3.utils.fromWei(initProjectBalance)
    assert.equal(initProjectBalanceInEther, 0)

    const initBalanceCreator = await balanceAddress(creatorAccount)
    const initBalanceCreatorInEther = web3.utils.fromWei(initBalanceCreator)

    await project.contribute({ from: account16, value: etherToWei(70) })
    await project.contribute({ from: account17, value: etherToWei(30) })

    const fundedProjectBalance = await balanceAddress(project.address)
    const fundedProjectBalanceInEther = web3.utils.fromWei(fundedProjectBalance)
    assert.equal(fundedProjectBalanceInEther, 100)

    await project.withdrawFunds();

    const finalBalanceCreator = await balanceAddress(creatorAccount)
    const finalBalanceCreatorInEther = web3.utils.fromWei(finalBalanceCreator)
    assert.isTrue(parseInt(finalBalanceCreatorInEther, 10) > parseInt(initBalanceCreatorInEther, 10)) // hard to be exact due to the gas usage

    const afterWithdrawProjectBalance = await balanceAddress(project.address)
    const afterWithdrawProjectBalanceInEther = web3.utils.fromWei(
      afterWithdrawProjectBalance
    )
    assert.equal(afterWithdrawProjectBalanceInEther, 0)
  })
})
