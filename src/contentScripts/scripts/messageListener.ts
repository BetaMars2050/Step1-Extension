
import { useWallet, tokenGiveawayContract, web3 } from '../../composables/useWallet'
import { getBEP20TokenByAddress } from '../../api/token'
import { formatUnit } from '../../utils/wei'
import contract from '../../utils/contract'
export const messageListener = () => {

    chrome.runtime.onMessage.addListener(({ message, data }: { message: string, data: any }, sender, sendResponse) => {
        console.log(message, data, sender, sendResponse)
        const { walletLogin, reConnectMetamask, switchNetworkETH, switchNetworkBSC, getMainTokenBalance } = useWallet()
        console.log('messageListener', message)
        switch (message) {
            case 'hide-airdrop-iframe':
                hideAirdrop()
                break;
            case 'hide-connect-wallet':
                hideConnectWallet()
                break;
            case "show-connect-wallet":
                showConnectWallet()
                break
            case 'connect-wallet':
                showConnectWallet()
                walletLogin().then().catch(err => {
                    console.log(err)
                    hideConnectWallet()
                })
                break
            case 'reconnect-wallet':
                reConnectMetamask()
                break
            case 'send-tweet':
                hideAirdrop()
                sendTweet(data)
                break
            case 'send-token-giveaway':

                if (data.data.tools.reward.tokenInfo.tokenAddress.toLowerCase() === contract.tokenGiveawayContractAddress.toLowerCase()) {
                    sendMainToken(data, sendResponse)
                } else {
                    sendOtherToken(data, sendResponse)
                }
                return true;
                break;
            case 'get-wallet-balance':
                getWalletBalance(data, sendResponse, getMainTokenBalance)
                return true
                break;
            case 'switch-network-BSC':
                switchNetworkBSC()
                break;
            case 'switch-network-ETH':
                switchNetworkETH()
                break;
            default:
                break
        }
    })

}

const getWalletBalance = ({ address, chainId }, sendResponse, getMainTokenBalance) => {

    Promise.all([getBEP20TokenByAddress(), getMainTokenBalance(address, chainId)]).then(
        res => {
            console.log('wallet balance', res)
            let tokens = [res[1]]
            if (res[0].data) {
                tokens = [...tokens, ...res[0].data]
            }
            tokens.forEach((v, i) => {

                if (Number(v.tokenDivisor)) {
                    console.log(v.tokenName, v.tokenQuantity, v.tokenDivisor, formatUnit[v.tokenDivisor])
                    v.tokenQuantity = web3.utils.fromWei(v.tokenQuantity, formatUnit[v.tokenDivisor])
                    v.tokenName = v.tokenSymbol
                    v.tokenUnit = formatUnit[v.tokenDivisor]
                    console.log(v.tokenQuantity)
                } else {
                    tokens.splice(i, 1)
                }


            })

            sendResponse({ status: 0, data: tokens });
        }
    ).catch(err => {
        console.log('err', err)
        sendResponse({ status: 1 });

    })

}

const showConnectWallet = () => {
    const dialog = document.querySelector("#step1-connect-wallet") as HTMLElement;
    dialog.style.display = "block";
}

const hideAirdrop = () => {
    let app = document.querySelector('#step1-airdrop') as HTMLElement
    app.style.display = 'none'
}

const hideConnectWallet = () => {
    let dialog = document.querySelector('#step1-connect-wallet') as HTMLElement
    dialog.style.display = 'none'
}

const sendTweet = (data) => {
    let tweetBtn = document.querySelector('[data-testid="SideNav_NewTweet_Button"]') as HTMLElement
    tweetBtn.click();
    setTimeout(() => {
        let tweetContent = document
            .querySelector('div[role="dialog"]')
            .querySelector('div[contenteditable="true"]');
        const text = ` #step1 \nhttps://test1.step1matrix.io/giveaway/${data}`;
        const r = new DataTransfer();
        r.setData("text", text);
        const a = new ClipboardEvent("paste", {
            clipboardData: r,
            bubbles: true,
        });
        tweetContent.dispatchEvent(a);
    }, 1e3);
};




const sendMainToken = async (info, sendResponse) => {
    const { reward } = info.data.tools
    const { tokenInfo: { tokenAddress }, tokenNum, quantity, distribution } = reward

    try {

        console.log('tokenGiveawayContract', tokenGiveawayContract)
        const result = await tokenGiveawayContract.methods.dropToken(
            tokenAddress,
            web3.utils.toWei(tokenNum),
            quantity,
            distribution,
            1,
            info.activityId
        ).send({
            from: info.walletAddress,
            value: web3.utils.toWei(tokenNum)
        })


        sendTweet(info.activityId)
        hideAirdrop()
        sendResponse({ status: 0 });
    } catch (err) {
        sendResponse({ status: 1, message: JSON.stringify(err) });
        console.log(err)
    }
}

const sendOtherToken = async (info, sendResponse) => {
    const { reward } = info.data.tools
    const { tokenInfo: { tokenAddress, tokenUnit }, tokenNum, quantity, distribution } = reward

    try {


        const tokenContract = new web3.eth.Contract(contract.tokenCommonABI, tokenAddress)

        let isApprove = await tokenContract.methods
            .allowance(info.walletAddress, tokenAddress)
            .call();

        console.log('isApprove', isApprove)

        if (isApprove === '0') {
            await tokenContract.methods
                .approve(tokenAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935")
                .send({ from: info.walletAddress });
        }


        console.log('tokenGiveawayContract', tokenGiveawayContract)

        const result = await tokenGiveawayContract.methods.dropToken(
            tokenAddress,
            web3.utils.toWei(tokenNum, tokenUnit),
            quantity,
            distribution,
            2,
            info.activityId
        ).send({
            from: info.walletAddress,
        })


        sendTweet(info.activityId)
        hideAirdrop()
        sendResponse({ status: 0 });
    } catch (err) {
        sendResponse({ status: 1, message: JSON.stringify(err) });
        console.log(err)
    }
}