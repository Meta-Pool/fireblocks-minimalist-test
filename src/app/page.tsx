'use client'
import { keyStores } from 'near-api-js';
import { useWalletSelector } from './WalletSelectorContext'

export default function Home() {

  const { selector, modal } = useWalletSelector()
  const handleSignIn = () => {
    modal.show();
  };

  const handleSignOut = async () => {
    const w = await selector.wallet()
    w.signOut()
  }

  const stake = async () => {
    const w = await selector.wallet()
    const r = await w.signAndSendTransaction({
      actions: [
        {
          type: "FunctionCall",
          params: {
            methodName: "deposit_and_stake",
            args: {},
            gas: "30000000000000",
            deposit: "1" + "0".repeat(24),
          },
        },
      ],
    });
    console.log(1, r)

  }
  if (selector && selector.isSignedIn()) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <button onClick={stake} style={{ width: "500px", fontSize: "2em", margin: "1em" }}>Stake 1 NEAR</button>
        <button onClick={() => handleSignOut()} style={{ width: "500px", fontSize: "2em" }}>Disconnect</button>
      </div>)
  } else {
    return <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    ><button
      onClick={() => handleSignIn()}
      style={{ width: "500px", fontSize: "2em", margin: "1em" }}
    >Connect</button>
    </div>
  }

}
