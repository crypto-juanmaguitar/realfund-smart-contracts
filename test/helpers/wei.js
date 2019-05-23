export const etherToWei = value =>
  web3.utils.toBN(web3.utils.toWei(value.toString(), 'ether'))

export const balanceAddress = address => web3.eth.getBalance(address)
