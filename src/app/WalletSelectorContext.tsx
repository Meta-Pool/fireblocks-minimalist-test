'use client'

import React, { useCallback, useContext, useEffect, useState } from "react";
import { map, distinctUntilChanged } from "rxjs";
import {
  NetworkId,
  setupWalletSelector,
  Wallet,
} from "@near-wallet-selector/core";
import type { WalletSelector, AccountState } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import { setupWalletConnect } from "@near-wallet-selector/wallet-connect";
import create from "zustand/vanilla";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";


declare global {
  interface Window {
    selector: WalletSelector;
    modal: WalletSelectorModal;
    account_id: string | null;
    wallet: Wallet | null;
  }
}

interface WalletSelectorContextValue {
  selector: WalletSelector;
  modal: WalletSelectorModal;
  accounts: Array<AccountState>;
  accountId: string | null;
}

export interface WalletStore {
  selector: WalletSelector | null;
  modal: WalletSelectorModal | null;
  account_id: string | null;
  wallet: Wallet | null;
}

const store = create<WalletStore>(() => ({
  selector: null,
  modal: null,
  account_id: null,
  wallet: null,
}));

const WalletSelectorContext =
  React.createContext<WalletSelectorContextValue | null>(null);

export const WalletSelectorContextProvider: any = ({ children }: any) => {
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletSelectorModal | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountState>>([]);

  const setupWallets = () => {
    let modules: any[] = [
        setupMyNearWallet(),
        setupWalletConnect({
            projectId: "9bf4d2879d593845ad1ee5fb7d9688d3",
            metadata: {
              name: "minimalist-example",
              description: "",
              url: "http://localhost:3000",
              icons: ["https://avatars.githubusercontent.com/u/37784886"],
            },
          }),
    ];
    
    return modules;
  };

  const init = useCallback(async () => {
    const _selector = await setupWalletSelector({
      network: "testnet",
      modules: setupWallets(),
    });

    const _modal = setupModal(_selector, {
      contractId: "",
    });
    const state = _selector.store.getState();
    setAccounts(state.accounts);

    store.setState({
      selector: _selector,
      modal: _modal,
      account_id: _selector.isSignedIn()
        ? _selector.store.getState().accounts.find((account) => account.active)
            ?.accountId || null
        : null,
      wallet: _selector.isSignedIn() ? await _selector.wallet() : null,
    });
    
    // keep window global variables
    window.selector = _selector;
    window.modal = _modal;
    window.account_id = _selector.isSignedIn()
      ? _selector.store.getState().accounts.find((account) => account.active)
          ?.accountId || null
      : null;
    window.wallet = _selector.isSignedIn() ? await _selector.wallet() : null;

    setSelector(_selector);
    setModal(_modal);
  }, []);

  useEffect(() => {
    init().catch((err) => {
      console.error(err);
      alert("Failed to initialise wallet selector");
    });
  }, [init]);

//   const { isConnected, address } = useAccount();
//   const { data: signer } = useSigner();
//   const { openConnectModal } = useConnectModal();
//   const { network, setConnected,setDisconnected } = useNetworkStore();

  useEffect(() => {
    if (!selector) {
      return;
    }

    const subscription = selector.store.observable
      .pipe(
        map((state) => state.accounts), // If breaks, update rxjs
        distinctUntilChanged()
      )
      .subscribe(async (nextAccounts) => {
        const wallet = selector.isSignedIn() ? await selector.wallet() : null;
        setAccounts(nextAccounts);
        store.setState((prev) => ({
          modal: modal,
          selector: selector,
          wallet: wallet,
          account_id: nextAccounts.find(
            (account: AccountState) => account.active
          )?.accountId!,
        }));
        // keep window global VARIABLES
        window.account_id = nextAccounts.find(
          (account: AccountState) => account.active
        )?.accountId!;
      });

    return () => subscription.unsubscribe();
  }, [selector]);

  if (!selector || !modal) {
    return null;
  }

  const accountId =
    accounts.find((account) => account.active)?.accountId || null;
  
  return (
    <WalletSelectorContext.Provider
      value={{
        selector,
        modal,
        accounts,
        accountId,
      }}
    >
      {children}
    </WalletSelectorContext.Provider>
  );
};

export function useWalletSelector() {
  const context = useContext(WalletSelectorContext);

  if (!context) {
    throw new Error(
      "useWalletSelector must be used within a WalletSelectorContextProvider"
    );
  }

  return context;
}
