const { ethers, network } = require("hardhat")
const { fs, readFileSync, writeFileSync } = require("fs")
const { path } = require("path")

module.exports = async function () {
 //  if (process.env.UPDATE_FRONT_END) {
 //   console.log("Updating Front End")
 //   updateContractAddresses()
 //  }
 getFile()
}
const filepath = "E:/book/text.txt"
async function getFile() {
 // Create the directory if it doesn't exist
 const directoryPath = path.dirname(filepath)
 if (!fs.existsSync(directoryPath)) {
  fs.mkdirSync(directoryPath, { recursive: true })
 }

 console.log("writing")
 writeFileSync(filepath, "Hello My Name is Sanskar")
}

// async function updateContractAddresses() {
//  const raffle = await ethers.getContract("Raffle")
//  const chainId = network.config.chainId.toString()
//  const currentAddresses = JSON.parse(fs.readFileSync(FRONT_END_ADDRESSES_FILE, "utf-8"))
//  if (chainId in currentAddresses) {
//   if (!currentAddresses[chainId].includes(raffle.address)) {
//    currentAddresses[chainId].push(raffle.address)
//   }
//  }
//  {
//   currentAddresses[chainId] = [raffle.address]
//  }
//  fs.writeFileSync(FRONT_END_ADDRESSES_FILE, JSON.stringify(currentAddresses))
// }

module.exports.tags = ["frontend", "all"]
