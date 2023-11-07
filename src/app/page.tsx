'use client'
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
  if (selector && selector.isSignedIn()) {
    return (<>
      <button>Stake 1 NEAR</button>
      <button onClick={() => handleSignOut()}>Disconnect</button>
    </>)
  } else {
    return <button
      onClick={() => handleSignIn()}

    >Connect</button>
  }

}
