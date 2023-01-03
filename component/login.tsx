import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";

import SocialLogin from "@biconomy/web3-auth";
import { ChainId } from "@biconomy/core-types";
import SmartAccount from "@biconomy/smart-account";
import { ethers } from "ethers";
import { useState, useEffect, useRef } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function login() {
  const [isLoggedIn, setisLoggedIn] = useState<boolean | null>(false);
  const [account, setAccount] = useState("");
  const socialLoginSDKRef = useRef<SocialLogin | null>();
  const [smartAccount, setSmartAccount] = useState<SmartAccount | null>();
  const [smartAccountAddress, setSmartAccountAddress] = useState<
    string | null
  >();

  const [walletProvider, setWalletProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [eoaAddress, setEoaAddress] = useState<string | null>(null);

  useEffect(() => {
    initSocialLoginSDK().then(() => {
      if (socialLoginSDKRef?.current?.provider) {
        setupSmartAccount();
      }
    });
  }, [eoaAddress]);

  const initSocialLoginSDK = async () => {
    try {
      const socialLoginSDK = new SocialLogin();
      await socialLoginSDK.init(ethers.utils.hexValue(ChainId.POLYGON_MUMBAI)); // Enter the network id in hex) parameter
      socialLoginSDKRef.current = socialLoginSDK;
    } catch (error) {
      console.log(error);
    }
  };

  const login = async () => {
    try {
      if (!socialLoginSDKRef.current) {
        /// Intialize the Social Login
        initSocialLoginSDK();
      }
      if (!socialLoginSDKRef.current?.provider) {
        /// Show the Social Login Connect modal
        socialLoginSDKRef.current?.showConnectModal();
        socialLoginSDKRef.current?.showWallet();
      } else {
        /// setup the Smart ContractWallet
        getEOAAccount();
        if (!smartAccount) {
          setupSmartAccount();
        } else {
          getSCWWallet(smartAccount);
        }
      }
      setisLoggedIn(true);
    } catch (error) {
      console.error(error);
    }
  };

  /// get the EOA account
  const getEOAAccount = async () => {
    try {
      if (socialLoginSDKRef.current) {
        const provider = new ethers.providers.Web3Provider(
          socialLoginSDKRef.current.provider
        );
        setWalletProvider(provider);
        const accounts = await provider.listAccounts();
        console.log("EOA address", accounts);
        setEoaAddress(accounts[0]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getSCWWallet = async (smartAccount: SmartAccount) => {
    try {
      if (smartAccount) {
        const smartContractWalletAddress = smartAccount.address;
        console.log("address", smartAccount);
        setSmartAccountAddress(smartContractWalletAddress);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const setupSmartAccount = async () => {
    try {
      const options = {
        activeNetworkId: ChainId.POLYGON_MUMBAI,
        supportedNetworksIds: [
          ChainId.GOERLI,
          ChainId.POLYGON_MAINNET,
          ChainId.POLYGON_MUMBAI,
        ],
        networkConfig: [
          {
            chainId: ChainId.POLYGON_MUMBAI,
            // Optional dappAPIKey (only required if you're using Gasless)
            dappAPIKey: "59fRCMXvk.8a1652f0-b522-4ea7-b296-98628499aee3",
            // if need to override Rpc you can add providerUrl:
          },
        ],
      };

      /// checking if Social login Account is created or not
      if (!socialLoginSDKRef?.current?.provider) return;
      socialLoginSDKRef.current.hideWallet();

      getEOAAccount();

      // intialize Smart Account
      const provider = new ethers.providers.Web3Provider(
        socialLoginSDKRef.current.provider
      );

      let smartAccount = new SmartAccount(provider, options);
      smartAccount = await smartAccount.init();
      setSmartAccount(smartAccount);

      getSCWWallet(smartAccount);
      setisLoggedIn(true);
    } catch (error) {
      console.log(error);
    }
  };

  const logout = async () => {
    try {
      if (!socialLoginSDKRef.current) {
        console.error("Web3Modal not initialized.");
        return;
      }
      await socialLoginSDKRef.current.logout();
      socialLoginSDKRef.current.hideWallet();
      setSmartAccount(null);
      setEoaAddress(null);
      setSmartAccountAddress(null);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <main className={styles.main}>
        <div className={styles.description}>
          <h1>Welcome to Biconomy Social Login with Smart Contract Wallet </h1>
        </div>
        <div>
          <a>EOA Address : {eoaAddress} </a>
          {smartAccountAddress && (
            <a>Smart Contract Wallet Address : {smartAccountAddress}</a>
          )}
        </div>
        <div className={styles.center}>
          <div className={styles.thirteen}>
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  login();
                } else logout();
              }}
            >
              {!isLoggedIn ? <a>Login</a> : <a>Logout</a>}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
