const { run } = require("hardhat")

async function verify(contractAddress, args) {
  try {
    console.log("wait verifying...")
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (e) {
    console.log(e.message, " is the e.message  ")
    if (e.message.toLowerCase() == "already verified") {
      console.log("Already Verified yayy")
    } else {
      console.log(e, e.message)
    }
  }
}

module.exports = { verify }
