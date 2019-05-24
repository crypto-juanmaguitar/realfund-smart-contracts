/* eslint-disable */
import './helpers/_environment'
import { increaseTime } from './helpers/time'
import { etherToWei, weiToEher, balanceAddressInEther } from './helpers/wei'

const Project = artifacts.require('Project')

const DAY = 3600 * 24 * 1000

contract('Project', accounts => {
  let project

  const creatorAccount = accounts[0]
  const _title = 'test project title'
  const _description = 'test project description'
  const _duration = DAY * 4
  const _goal = 100

  let contributionsAddressInEther

  beforeEach(async () => {
    project = await Project.new(
      creatorAccount,
      _title,
      _description,
      _duration,
      etherToWei(_goal)
    )

    contributionsAddressInEther = async address => {
      const balance = await project.contributions.call(address)
      return weiToEher(balance)
    }
  })

  afterEach(async () => {
    project = null
  })

  it('starts with a balance of zero', async () => {
    const projectAddress = await project.address
    const balance = await balanceAddressInEther(projectAddress)
    assert.equal(balance, 0)
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

    const balanceBefore = await balanceAddressInEther(project.address)
    assert.equal(balanceBefore, 0)

    await project.contribute({ from: account10, value: etherToWei(10) })
    await project.contribute({ from: account11, value: etherToWei(20) })

    const balanceAfter = await balanceAddressInEther(project.address)
    assert.equal(balanceAfter, 30)
  })

  it('keeps track of contributor balance', async () => {
    const account12 = accounts[12]
    const account13 = accounts[13]

    const balanceProject = await balanceAddressInEther(project.address)
    assert.equal(balanceProject, 0)

    await project.contribute({ from: account12, value: etherToWei(10) })
    await project.contribute({ from: account13, value: etherToWei(20) })
    await project.contribute({ from: account12, value: etherToWei(30) })

    const balanceAccount12 = await contributionsAddressInEther(account12)
    const balanceAccount13 = await contributionsAddressInEther(account13)
    assert.equal(balanceAccount12, 40)
    assert.equal(balanceAccount13, 20)
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

    const balanceProject = await balanceAddressInEther(project.address)
    assert.equal(balanceProject, 10)
  })

  it('allows creator to withdraw project funds when goal is reached', async () => {
    const account16 = accounts[16]
    const account17 = accounts[17]

    const initProjectBalance = await balanceAddressInEther(project.address)
    assert.equal(initProjectBalance, 0)

    const initBalanceCreator = await balanceAddressInEther(creatorAccount)

    await project.contribute({ from: account16, value: etherToWei(70) })
    await project.contribute({ from: account17, value: etherToWei(30) })

    const fundedProjectBalance = await balanceAddressInEther(project.address)
    assert.equal(fundedProjectBalance, 100)

    await project.withdrawFunds()

    const finalBalanceCreator = await balanceAddressInEther(creatorAccount)
    assert.isTrue(+finalBalanceCreator > +initBalanceCreator) // hard to be exact due to the gas usage

    const afterWithdrawProjectBalance = await balanceAddressInEther(
      project.address
    )
    assert.equal(afterWithdrawProjectBalance, 0)
  })

  it('does not allow non-creators to withdraw project funds', async () => {
    const account18 = accounts[18]
    const account19 = accounts[19]
    await project.contribute({ from: account18, value: etherToWei(80) })
    await project.contribute({ from: account19, value: etherToWei(30) })
    try {
      await project.withdrawFunds({ from: account18 })
      assert.fail()
    } catch (err) {
      assert.ok(/revert/.test(err.message))
    }
  })

  it('allows contributors to get refund after time is up and goal is not reached', async () => {
    const account20 = accounts[20]
    await project.contribute({ from: account20, value: etherToWei(50) })

    const initialBalanceAccount20 = await balanceAddressInEther(account20)

    const initContributionBalanceAccount20 = await contributionsAddressInEther(
      account20
    )
    assert.equal(initContributionBalanceAccount20, 50)

    await increaseTime(DAY * 5)

    await project.getRefund({ from: account20 })

    const finalBalanceAccount20 = await balanceAddressInEther(account20)

    assert.isTrue(+finalBalanceAccount20 > +initialBalanceAccount20) // hard to be exact due to the gas usage
  })

  it('does not allow contributors to get refund after time is up and goal is reached', async () => {
    const account21 = accounts[21]
    const account22 = accounts[22]

    await project.contribute({ from: account21, value: etherToWei(50) })
    await project.contribute({ from: account22, value: etherToWei(50) })

    const contributionBalanceAccount21 = await contributionsAddressInEther(
      account21
    )
    assert.equal(contributionBalanceAccount21, 50)

    await increaseTime(DAY * 5)

    try {
      await project.getRefund({ from: account21 })
      assert.fail()
    } catch (err) {
      assert.ok(/revert/.test(err.message))
    }
  })

  it('does not allow contributors to get refund before time is up and goal is not reached', async () => {
    const account23 = accounts[23]

    await project.contribute({ from: account23, value: etherToWei(50) })

    const contributionBalanceAccount23 = await contributionsAddressInEther(
      account23
    )
    assert.equal(contributionBalanceAccount23, 50)

    try {
      await project.getRefund({ from: account23 })
      assert.fail()
    } catch (err) {
      assert.ok(/revert/.test(err.message))
    }
  })
})
