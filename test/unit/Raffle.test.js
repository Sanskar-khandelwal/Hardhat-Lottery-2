const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
 ? describe.skip
 : describe("Raffle Unit Test", async function () {
    let raffle, vrfCoordinatorV2Mock, raffleEntraceFee, deployer, interval
    const chainId = network.config.chainId
    //   const { assert } = await import("chai")
    beforeEach(async function () {
     deployer = (await getNamedAccounts()).deployer
     await deployments.fixture("all")
     raffle = await ethers.getContract("Raffle", deployer)
     vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
     raffleEntraceFee = await raffle.getEntraceFee()
     interval = await raffle.getInterval()
    })

    describe("contructor", function () {
     it("initializes the raffle correctly", async function () {
      const raffleState = await raffle.getRaffleState()
      assert.equal(raffleState.toString(), "0")
      console.log(raffleState.toString(), interval.toString())
      assert.equal(interval.toString(), networkConfig[chainId].interval)
     })
    })

    describe("enter Raffle", function () {
     it("reverts when you don't pay enough", async function () {
      await expect(raffle.enterRaffle()).to.be.reverted
     })
     it("records players when they enter", async function () {
      await raffle.enterRaffle({ value: raffleEntraceFee })
      const playerFromContract = await raffle.getPlayer(0)
      assert.equal(playerFromContract, deployer)
     })

     it("emits event when player enter", async function () {
      await expect(raffle.enterRaffle({ value: raffleEntraceFee })).to.emit(raffle, "RaffleEnter")
     })

     it("does not let player when raffle is not open", async function () {
      await raffle.enterRaffle({ value: raffleEntraceFee })
      await network.provider.send("evm_increaseTime", [Number(interval) + 1])
      await network.provider.send("evm_mine", [])
      // now checkup should return true coz we met all the criteria that makes checkupkeep true
      await raffle.performUpkeep("0x")
      await expect(raffle.enterRaffle({ value: raffleEntraceFee })).to.be.reverted
     })
    })

    describe("checkUpkeep", function () {
     it("returns false if people haven't sent any Eth", async function () {
      await network.provider.send("evm_increaseTime", [Number(interval) + 1])
      await network.provider.send("evm_mine", [])
      const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x")
      assert(!upkeepNeeded)
     })

     it("returns false if raffle isn't open", async function () {
      await raffle.enterRaffle({ value: raffleEntraceFee })
      await network.provider.send("evm_increaseTime", [Number(interval) + 1])
      await network.provider.send("evm_mine", [])
      await raffle.performUpkeep("0x")
      const raffleState = await raffle.getRaffleState()
      console.log(raffleState, "the raffle state is")
      const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x")
      assert.equal(raffleState, 1)

      assert.equal(upkeepNeeded, false)
     })
    })

    describe("performUpkeep", function () {
     it("it can only run if checkupkeep is true", async function () {
      await raffle.enterRaffle({ value: raffleEntraceFee })
      await network.provider.send("evm_increaseTime", [Number(interval) + 1])
      await network.provider.send("evm_mine", [])
      const tx = await raffle.performUpkeep("0x")
      assert(tx)
     })

     it("reverts when checkupkeep is false", async function () {
      await raffle.enterRaffle({ value: raffleEntraceFee })
      expect(raffle.performUpkeep("0x")).to.be.revertedWith("Raffle__UpkeepNotNeeded")
     })

     it("updates the raffle states, emits an event, and calls the vrf coordinator", async function () {
      await raffle.enterRaffle({ value: raffleEntraceFee })
      await network.provider.send("evm_increaseTime", [Number(interval) + 1])
      await network.provider.send("evm_mine", [])
      const txResponse = await raffle.performUpkeep("0x")
      const txReceipt = await txResponse.wait(1)
      const requestId = txReceipt.logs[1].args.requestId
      const raffleState = await raffle.getRaffleState()
      assert(Number(requestId) > 0)
      assert.equal(raffleState.toString(), "1")
     })
    })

    describe("fulfillRandomWords", function () {
     beforeEach(async function () {
      await raffle.enterRaffle({ value: raffleEntraceFee })
      await network.provider.send("evm_increaseTime", [Number(interval) + 1])
      await network.provider.send("evm_mine", [])
      it("can only be called after performUpkeep ", async function () {
       expect(vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address).to.be.reverted)
       expect(vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address).to.be.reverted)
      })
      it("picks a winner, resets the lottery, and sends money", async function () {
       const additionalEntrace = 3
       const account = await ethers.getSigners()
       const startingAccountIndex = 1
       for (let i = startingAccountIndex; i < startingAccountIndex + additionalEntrace; i++) {
        const accountConnectedRaffle = raffle.connect(account[i])
        await accountConnectedRaffle.enterRaffle({ value: raffleEntraceFee })
       }
       const startingTimeStamp = await raffle.getLatestTimeStamp()

       //call performUpkeep (mock being chainlink keepers)
       // fulfillRandomword (mock being the chainlink Vrf)
       await new Promise(async (resolve, reject) => {
        raffle.once("WinnerPicked", async () => {
         console.log("Found the Winner")
         try {
          const recentWinner = await raffle.getRecentWinner()

          const raffleState = await raffle.getRaffleState()
          const endingTimeStamp = await raffle.getLatestTimeStamp()
          const numPlayers = await raffle.getNumberOfPlayers()
          const winnerEndingBalance = await account[1].geBalance()
          assert.equal(numPlayers.toString(), "0")
          assert.equal(raffleState.toString(), "0")
          assert.equal(
           winnerEndingBalance.toString(),
           winnerStartingBalance.add(
            raffleEntraceFee.mul(additionalEntrace).add(raffleEntraceFee).toString(),
           ),
          )
         } catch (e) {
          reject(e)
         }
         resolve()
        })
        //setting up the listener
        //below we will fire the event, and the listener wil pick it up nad resolve
        const tx = await raffle.performUpkeep("0x")
        const txReceipt = await tx.wait(1)
        const winnerStartingBalance = await account[1].getBalance()
        await vrfCoordinatorV2Mock.fulfillRandomWords(
         txReceipt.logs[1].args.requestId,
         raffle.target,
        )
       })
      })
     })
    })
   })
