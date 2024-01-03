const { ethers } = require("hardhat")

const networkConfig = {
  11155111: {
    name: "sepolia",
    vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    entrandeFee: ethers.parseEther("0.01"),
    gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    subscriptionId: "00",
    callBackGasLimit: "500000",
    interval: "30",
  },
  31337: {
    name: "hardhat",
    /* vrfCoordinatorV2: Not needed as we are gonna deploy mocks */
    entranceFee: ethers.parseEther("0.01"),
    gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // use anything here
    callbackGasLimit: "500000",
    interval: "30",
  },
}

const developmentChains = ["localhost", "hardhat"]

module.exports = {
  networkConfig,
  developmentChains,
}
