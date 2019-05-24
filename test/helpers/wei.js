export const etherToWei = value =>
  web3.utils.toBN(web3.utils.toWei(value.toString(), 'ether'))

export const balanceAddress = address => web3.eth.getBalance(address)

export const weiToEher = wei => web3.utils.fromWei(wei)

export const balanceAddressInEther = async address => {
  const balance = await balanceAddress(address)
  return weiToEher(balance)
}
