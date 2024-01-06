const { developmentChains } = require("../helper-hardhat-config")

//calculated value based on the gas Price of the chain.
module.exports = async function ({ getNamedAccounts, deployments }) {
  const BASE_FEE = ethers.parseEther("0.25") // 0.25 link for every random number request
  const GAS_PRICE_LINK = 1e9

  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId
  const args = [BASE_FEE, GAS_PRICE_LINK]
  if (developmentChains.includes(network.name)) {
    log("Local network detected deploying mocks")

    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: args,
    })
    log("--Mocks Deployed--")
    log("-----------------------------")
  }
}

module.exports.tags = ["all", "mocks"]
