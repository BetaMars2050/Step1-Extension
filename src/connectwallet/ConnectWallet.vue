
<script setup lang="ts">
import { sendChromeMessage } from '../plugins/chromeService'
import { onMounted, ref } from 'vue';
import { bindToken, findMainWallet, setMainWallet } from '../api/login'
import type { MainWalletInfo } from './types';
import { getChainName, checkChainId } from '../utils/index'
import { showMessage } from '../utils/message';
const walletToken = ref('')
const chainId = ref('')
const walletAddress = ref('')
const mainWalletInfo = ref<MainWalletInfo>()

const closeDialog = () => {
    sendChromeMessage('hide-connect-wallet')
    console.log(window)
}

const connect = () => {
}

const disconnect = () => {
    chrome.storage.local.set({ wt: null, address: null });

}

const switchNetwork = (chainName: string) => [

    sendChromeMessage('switch-network-' + chainName)
]


const checkTwoToken = () => {
    chrome.storage.local.get(["wt", "st"], function (result) {
        console.log(result, "result");
        if (result.wt && result.st) {
            bindToken();
        }
    });
};

const queryMainWallet = () => {
    findMainWallet().then(res => {
        console.log('main wallet info', res)
        mainWalletInfo.value = res.data
    }).catch(err => {
        console.log(err)
    })

}

const setDefaultWallet = () => {

    setMainWallet({ walletAddress: walletAddress.value, chainName: getChainName(chainId.value).chainName }).then(res => {

        console.log(res)
        queryMainWallet()

    }).catch(err => {
        console.log('err', err)
        showMessage({ message: err.msg, type: 'error' })

    })

}

onMounted(async () => {

    let result = await chrome.storage.local.get(["wt", "address", "chainId"]);
    console.log('result', result)
    if (result?.wt) {
        walletToken.value = result.wt
        sendChromeMessage('reconnect-wallet')
        queryMainWallet()
    }

    if (result?.address) {
        walletAddress.value = result.address
    }
    if (result?.chainId) {

        chainId.value = result.chainId
    }

    chrome.storage.onChanged.addListener(function (changes, namespace) {
        console.log('changes', changes, namespace)
        if (changes?.address) {
            console.log('changes.address.newValue', changes.address.newValue)
            walletAddress.value = changes.address.newValue
        }
        if (changes?.wt) {
            console.log('changes.wt.newValue', changes.wt.newValue)
            walletToken.value = changes.wt.newValue
            queryMainWallet()
        }

        if (changes?.chainId) {
            console.log('changes.chainId.newValue', changes.chainId.newValue)
            chainId.value = changes.chainId.newValue
        }

        checkTwoToken()

    });

    // console.log('walletToken', walletToken)
    // if (!walletToken.value) {
    //     connect()
    // }


})


</script>
<template>
    <div class="connect-wallet">
        <div class="header">
            <div class="close" i-mdi-close @click="closeDialog"></div>
            <div class="text-20px text-#0f1419 font-bold"> Connect Wallet </div>
        </div>

        <div class="container w-456px mx-auto">

            <div class="no-connect flex justify-center items-center" v-if="!walletToken" @click="connect">
                <img class="w-28px h-28px" src="../../assets/metamask-logo.png" alt="">
                <img class="w-383px h-76px mx-10px" src="../../assets/step-progress.png" alt="">
                <img class="w-28px h-40px" src="../../assets/text-logo.png" alt="">
            </div>

            <div class="mt-20px" v-else>
                <div class="w-100% flex justify-between items-center">
                    <div class="flex justify-start items-center">
                        <img class="w-28px h-28px mr-20px" src="../../assets/metamask-logo.png" alt="">
                        <div class="flex flex-col justify-start items-start text-14px text-#536471">
                            <div class="mb-6px flex  justify-start items-center">{{ walletAddress }}
                                <img src="../../assets/wallet-icon.png" style="width:16px;height:16px;margin-left: 10px;"
                                    alt="" v-if="mainWalletInfo?.walletAddress === walletAddress">
                                <div class="btn-set" @click="setDefaultWallet" v-else>
                                    Set Default
                                    <img src="../../assets/set-default-icon.png" style="width: 16px; height: 16px;" alt="">
                                </div>
                            </div>
                            <div>{{ getChainName(chainId).fullName }}</div>
                        </div>
                    </div>
                    <div class="text-20px text-#536471 cursor-pointer" i-icon-park-outline-switch></div>
                </div>

                <div class="error-msg  justify-start mt-10px " v-if="!(checkChainId(chainId))">
                    <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
                    Please switch to the correct chain!
                </div>

                <div class="error-msg  justify-start mt-10px " v-if="mainWalletInfo?.walletAddress !== walletAddress">
                    <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
                    Please log in to the main wallet: {{ mainWalletInfo?.walletAddress.substring(0, 6) + '******' +
                        mainWalletInfo?.walletAddress.substring(mainWalletInfo?.walletAddress.length -
                            6, mainWalletInfo?.walletAddress.length) }}
                </div>

                <div class="row mt-20px " v-if="!(checkChainId(chainId))">
                    <div class="chain-btn" @click="switchNetwork('ETH')"><img src="../../assets/eth-icon.png" alt="">ETH
                    </div>
                    <div class="chain-btn" @click="switchNetwork('BSC')"><img src="../../assets/bsc-icon.png" alt="">BSC
                    </div>

                </div>

                <div class="mt-20px flex justify-center items-center w-100% px-73px" v-else>
                    <div class="btn" @click="disconnect">Sign Out</div>
                </div>
            </div>

        </div>

    </div>
</template>

<style lang="scss" scoped>
.connect-wallet {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    min-height: 140px;
    background: #FFFFFF;
    border-radius: 14px;
    padding: 20px;
    font-family: Oswald-Heavy, Oswald;

    .header {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;

        .close {
            position: absolute;
            top: 0;
            left: 0;
            font-size: 28px;
            color: #0F1419;
            cursor: pointer;
            font-weight: 700;
        }
    }


    .row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 0 80px;

        .chain-btn {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 84px;
            height: 32px;
            background: #1D9BF0;
            border-radius: 145px;
            font-size: 15px;
            font-weight: 700;
            color: #FFFFFF;
            line-height: 20px;
            cursor: pointer;

            img {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                margin-right: 5px;
            }
        }
    }

    .error-msg {
        display: flex;
        align-items: center;
        width: 100%;
        font-size: 12px;
        font-weight: 400;
        color: #FF4545;
        padding-left: 50px;

        .error-icon {
            font-size: 16px;
        }
    }

    .btn-set {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 92px;
        height: 22px;
        background: #00FFBD;
        border-radius: 145px;
        font-size: 12px;
        font-weight: 400;
        color: #0F1419;
        line-height: 16px;
        margin-left: 10px;
        cursor: pointer;

        img {
            margin-left: 5px;
        }
    }

    .btn {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 125px;
        height: 32px;
        background: rgba(15, 20, 25, 0.2);
        border-radius: 145px;
        font-size: 15px;
        font-weight: 700;
        color: #FFFFFF;
        cursor: pointer;
    }
}
</style>