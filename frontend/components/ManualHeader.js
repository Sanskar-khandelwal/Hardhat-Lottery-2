import React, { useEffect } from "react"
import { useMoralis } from "react-moralis"
import { Button } from "web3uikit"
const ManualHeader = () => {
  const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading } =
    useMoralis()

  useEffect(() => {
    if (typeof window != "undefined") {
      if (window.localStorage.getItem("connected") != null) {
        enableWeb3()
      }
    }
  }, [isWeb3Enabled])

  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      console.log(`connected to ${account}`)
      if (account == null) {
        if (typeof window != "undefined") {
          localStorage.removeItem("connected")
          deactivateWeb3()
        }
      }
    })
  }, [])
  return (
    <>
      {account ? (
        <button> Connected to {account.slice(0, 4)} ... </button>
      ) : (
        <button
          onClick={async () => {
            await enableWeb3()
            window.localStorage.setItem("connected", "injected")
          }}
          disabled={isWeb3EnableLoading}
        >
          connect
        </button>
      )}
    </>
  )
}

export default ManualHeader
