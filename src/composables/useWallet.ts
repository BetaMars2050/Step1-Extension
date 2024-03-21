
import createMetaMaskProvider from 'metamask-extension-provider'
import { getNonce, login } from '../api/login'
import Web3 from 'web3'
import contract from '../utils/contract'
import { sendChromeMessage } from '../plugins/chromeService'
import { checkChainId } from '../utils'
// , login, logout 
export let web3, tokenGiveawayContract, provider;


export const useWallet = () => {



  const connectMetaMask = () => {
    return new Promise(async (resolve, reject) => {
      try {
        provider = createMetaMaskProvider()
        let accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[]
        resolve({ account: accounts[0], provider })
      } catch (err) {
        console.log('err', err)
        reject(err)
      }
    })
  }

  const reConnectMetamask = async () => {
    let res = await connectMetaMask();
    console.log("connect metamask success", res);
    const { account, provider } = res as { account: string, provider: any };
    web3 = new Web3(provider);
    console.log('web3', web3)
    initContract()
    subMetamaskEvent(provider);
  }


  const getNonceByAddress = (account: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        let result = await getNonce({ address: account })
        resolve(result.data)
      } catch (err) {
        reject(err)
      }
    })
  }

  const walletSign = (web3: any, account: string, nonce: string) => {
    return new Promise(async (resolve, reject) => {
      web3.eth.personal.sign(
        web3.utils.utf8ToHex(nonce),
        account,
        (err: any, res: any) => {
          if (err) {
            reject(err.message);
          } else {
            resolve(res);
          }
        }
      );
    });
  };

  const walletLogin = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(' wallet login')
        let { account, provider } = await connectMetaMask() as { account: string, provider: any };

        web3 = new Web3(provider) as any
        let nonce = await getNonceByAddress(account) as string
        console.log('nonce', nonce)
        let sign = await walletSign(web3, account, nonce) as string
        let { data } = await login({
          sign,
          address: account,
          chainName: "BSC",
        });
        const chainId = await provider.request({ method: 'eth_chainId' })
        console.log(' chain id', chainId, web3.utils.hexToNumber(chainId))
        console.log('wallet token', data);
        chrome.storage.local.set({ wt: data, address: account, chainId: web3.utils.hexToNumber(chainId) });
        initContract()
        subMetamaskEvent(provider)
        resolve(data);
      } catch (err) {
        reject(err);
        console.log("login err", err);
      }
    });
  };

  const initContract = () => {
    tokenGiveawayContract = new web3.eth.Contract(contract.tokenGiveawayContractABI, contract.tokenGiveawayContractAddress)
    console.log('tokenGiveawayContract', tokenGiveawayContract)
  }

  const subMetamaskEvent = (provider) => {
    onChainChanged(provider)
    onAccountsChanged(provider)
    onWalletConnectChanged(provider)

  }

  const onChainChanged = (provider) => {
    provider.on("chainChanged", (chainId) => {
      console.log(web3.utils.hexToNumber(chainId))
      let id = web3.utils.hexToNumber(chainId)
      chrome.storage.local.set({ chainId: id });
      if (!checkChainId(id)) {

        const dialog = document.querySelector("#step1-connect-wallet") as HTMLElement;
        dialog.style.display = "block";
      }

    });
  }

  const onAccountsChanged = (provider) => {
    provider.on("accountsChanged", async (accounts) => {
      console.log(accounts, 'current accounts')

      if (!accounts.length) {
        chrome.storage.local.set({ wt: null, address: null, chainId: null });
      } else {

      }
    });

  }

  const onWalletConnectChanged = (provider) => {

    provider.on('connect', async (connectInfo) => {
      console.log(connectInfo, 'isConnect')
      let isConnect = provider.isConnected()

      if (!isConnect) {
        chrome.storage.local.set({ wt: null, address: null, chainId: null });
      }

    });

  }

  const switchNetworkETH = async () => {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x1" }],
    });
  }

  const switchNetworkBSC = async () => {
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x61" }],
      });

    } catch (switchError) {
      console.log("switch chain error ", switchError);
      if (switchError.code === 4902) {
        try {
          let networks = await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x61",
                chainName: "BSC Testnet",
                rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
                nativeCurrency: {
                  name: "BNB",
                  symbol: "tBNB",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://testnet.bscscan.com/"],
              },
            ],
          });

        } catch (addError) {
          console.log("add chain error ", addError);

        }
      }
    }
  }

  const getMainTokenBalance = async (address: string, chainId: number) => {
    console.log('web3', web3)
    console.log('provider', provider)
    console.log('tokenGiveawayContract', tokenGiveawayContract)
    let balance = await web3.eth.getBalance(address)

    return {
      tokenAddress: contract.tokenGiveawayContractAddress,
      tokenName: chainId === 1 ? "ETH" : "BNB",
      tokenSymbol: chainId === 1 ? "ETH" : "BNB",
      tokenQuantity: balance,
      tokenDivisor: "18"
    }

  }

  return {
    getMainTokenBalance,
    connectMetaMask,
    getNonceByAddress,
    walletSign,
    walletLogin,
    reConnectMetamask,
    switchNetworkBSC,
    switchNetworkETH
  }
}