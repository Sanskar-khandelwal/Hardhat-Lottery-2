const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

/* 
 address vrfCoordinatorV2,
    uint256 entranceFee,
    bytes32 gasLane,
    uint64 subscriptionId,
    uint32 callbackGasLimit,
    uint32 interval*/

module.exports = async ({ deployments, getNamedAccounts }) => {
 const { deploy, log, get } = deployments
 const { deployer } = await getNamedAccounts()

 const chainId = network.config.chainId

 const VRF_SUB_FUND_AMOUNT = ethers.parseEther("3")

 let vrfCoordinatorV2Address
 let subscriptionId
 let VRFCoordinatorV2Mock

 if (developmentChains.includes(network.name)) {
  VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
  vrfCoordinatorV2Address = VRFCoordinatorV2Mock.target
  const transactionResponse = await VRFCoordinatorV2Mock.createSubscription()
  const transactionReceipt = await transactionResponse.wait(1)
  // console.log(transactionReceipt)
  subscriptionId = transactionReceipt.logs[0].args.subId

  await VRFCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
 } else {
  vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
  subscriptionId = networkConfig[chainId].subscriptionId
 }

 const entranceFee = networkConfig[chainId].entranceFee
 const gasLane = networkConfig[chainId].gasLane
 const callbackGasLimit = networkConfig[chainId].callbackGasLimit
 const interval = networkConfig[chainId].interval

 const args = [
  vrfCoordinatorV2Address,
  entranceFee,
  gasLane,
  subscriptionId,
  callbackGasLimit,
  interval,
 ]

 const raffle = await deploy("Raffle", {
  from: deployer,
  log: true,
  args: args,
  waitConfirmations: network.config.blockConfirmations || 1,
 })
 if (developmentChains.includes(network.name)) {
  await VRFCoordinatorV2Mock.addConsumer(subscriptionId, raffle.address)
 }
 if (!developmentChains.includes(network.name)) {
  log("verifyingg contract")
  await verify(raffle.address, args)
 }
 log("----------------------------------")
}

module.exports.tags = ["all", "raffle"]
