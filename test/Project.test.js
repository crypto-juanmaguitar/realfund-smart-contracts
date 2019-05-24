/* eslint-disable */
import './helpers/_environment'
import { increaseTime } from './helpers/time'
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
  const [
    firstAccount,
    secondAccount,
    thirdAccount,
    forthAccount,
    fifthAccount
  ] = accounts
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
      etherToWei(_goal)
    )
  })

  afterEach(async () => {
    project = null
  })

  it('starts with a balance of zero', async () => {
    const projectAddress = await project.address
    const balance = await balanceAddress(projectAddress)
    const balanceInEther = web3.utils.fromWei(balance, 'ether')
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
    const balanceProject = await balanceAddress(project.address)
    const balanceProjectInEther = web3.utils.fromWei(balanceProject, 'ether')
    assert.equal(balanceProjectInEther, 0)

    await project.contribute({ from: secondAccount, value: etherToWei(10) })
    await project.contribute({ from: thirdAccount, value: etherToWei(20) })

    const balance = await balanceAddress(project.address)
    const balanceInEther = web3.utils.fromWei(balance, 'ether')
    assert.equal(balanceInEther, 30)
  })

  it('keeps track of contributor balance', async () => {
    const balanceProject = await balanceAddress(project.address)
    const balanceProjectInEther = web3.utils.fromWei(balanceProject, 'ether')
    assert.equal(balanceProjectInEther, 0)

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

  it('does not allow for donations when time is up', async () => {
    await project.contribute({ from: secondAccount, value: etherToWei(10) })
    await increaseTime(DAY * 5)
    try {
      await project.contribute({ from: thirdAccount, value: etherToWei(30) })
      assert.fail()
    } catch (err) {
      assert.ok(/revert/.test(err.message))
    }

    const balanceProject = await balanceAddress(project.address)
    const balanceProjectInEther = web3.utils.fromWei(balanceProject, 'ether')
    assert.equal(balanceProjectInEther, 10)
  })

  it('creator automatically gets paid out once the goal is reached', async () => {
    const creatorAccount = firstAccount
    const initProjectBalance = await balanceAddress(project.address)
    const initProjectBalanceInEther = web3.utils.fromWei(
      initProjectBalance,
      'ether'
    )
    assert.equal(initProjectBalanceInEther, 0)

    const initBalanceCreator = await balanceAddress(creatorAccount)
    const initBalanceCreatorInEther = web3.utils.fromWei(
      initBalanceCreator,
      'ether'
    )

    await project.contribute({ from: secondAccount, value: etherToWei(70) })
    await project.contribute({ from: thirdAccount, value: etherToWei(30) })

    const finalBalanceCreator = await balanceAddress(creatorAccount)
    const finalBalanceCreatorInEther = web3.utils.fromWei(
      finalBalanceCreator,
      'ether'
    )
    console.log({initBalanceCreator, finalBalanceCreator})
    assert.isAbove(finalBalanceCreatorInEther, initBalanceCreatorInEther) // hard to be exact due to the gas usage

    const afterPaidOutProjectBalance = await balanceAddress(project.address)
    const afterPaidOutProjectBalanceInEther = web3.utils.fromWei(
      afterPaidOutProjectBalance,
      'ether'
    )
    assert.equal(afterPaidOutProjectBalanceInEther, 0)

  })
})
