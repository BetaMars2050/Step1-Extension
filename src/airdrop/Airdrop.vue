<script setup lang="ts">
import { sendChromeMessage } from '../plugins/chromeService'
import { useDateFormat } from '@vueuse/core'
import type { ObjType, NftReward, EbtForm, Question, Mission, Activity, TokenReward, TwUserInfo } from './types'
import { ref, reactive, watchEffect, computed, onMounted } from 'vue'
import { sendGiveawayActivity, getReward, getEligibility, getGaming, getMission } from '../api/activitys'
import { searchUserByUsername } from '../api/twitter'
import Web3 from 'web3'
import UploadExcel from './components/UploadExcel.vue'
import { showMessage } from '../utils/message'
import contract from '../utils/contract'
import { checkChainId } from '../utils'
import moment from 'moment'



const isLoading = ref<boolean>(false)
const campaign = ref<string>('')
const startTime = ref<Date | string | number>('')
const endTime = ref<Date | string | number>('')
const currentTools = ref<number>(0)
const walletToken = ref<string>('')
const walletAddress = ref<string>('')
const chainId = ref<number>(0)
const isShowClearConfirm = ref<boolean>(false)
const isShowContinueConfirm = ref<boolean>(false)

const mainErrMsg = reactive<ObjType<string>>({
  campaignErr: '',
  startTimeErr: '',
  endTimeErr: ''
})

const rewardType = ref<string>('')
const rewardSteps = ref<number>(0)

const tokenRewardForm = reactive<TokenReward>({
  rewardId: 1,
  type: 0,
  distribution: 0,
  tokenName: "",
  tokenNum: "",
  quantity: null,
  tokenInfo: {
    tokenName: '',
    tokenAddress: ''
  }
})

const tokenErrMsg = reactive<ObjType<string>>({
  typeErr: "",
  distributionErr: "",
  tokenNameErr: "",
  tokenNumErr: "",
  quantityErr: ''

})

const nftRewardForm = reactive<NftReward>({
  rewardId: 2,
  nftName: "",
  nftAddress: "",
  nftIds: [],
  type: "",
})

const nftErrMsg = reactive<ObjType<string>>({
  nftNameErr: "",
  nftAddressErr: "",
  nftIdsErr: '',
  typeErr: "",
})

const eligibilitySteps = ref<number>(0)
const eligibilityType = ref<string>('')

const eligibilityForm = reactive<EbtForm>({
  whitelist: [],
  score: {
    totalScore: {
      score: 0,
      status: 0
    },
    assetsScore: {
      score: 0,
      status: 0
    },
    luckyScore: {
      score: 0,
      status: 0
    },
    socialScore: {
      score: 0,
      status: 0
    },
    activeScore: {
      score: 0,
      status: 0
    }
  }
})

const scoreErrMsg = reactive<ObjType<string>>({
  totalScoreErr: '',
  assetsScoreErr: '',
  luckyScoreErr: '',
  socialScoreErr: '',
  activeScoreErr: ''
})

const whitelistErrMsg = ref<string>('')

const missionSteps = ref<number>(0)
const missionType = ref<string>('')

const missionForm = reactive<Mission>({
  like: false,
  follow: [],
  retweet: false
})

const missionErr = reactive<ObjType<string>>({
  twitterErr: ''
})


const searchValue = ref<string>('')

const arenaSteps = ref<number>(0)


const arenaType = ref<string>('')
const questionList = ref<Question[]>([
  {
    question: "",
    questionErr: "",
    answerOne: "",
    answerOneErr: "",
    answerOneFlag: true,
    answerTwo: "",
    answerTwoErr: "",
    answerTwoFlag: false,
    answerThree: "",
    answerThreeErr: "",
    answerThreeFlag: false
  }
])
const questionErr = ref<string>('')

// 0  Default
// 1  Uncomplete
// 2  Completed
// 3  Not set
const rewardStatus = ref<number>(0)

const eligibilityStatus = ref<number>(0)
const scoreStatus = ref<number>(0)
const whitelistStatus = ref<number>(0)

const missionStatus = ref<number>(0)
const twitterStatus = ref<number>(0)

const arenaStatus = ref<number>(0)
const reSearchStatus = ref<number>(0)

onMounted(async () => {

  let result = await chrome.storage.local.get(["wt", "st", "chainId", "address"]);
  console.log('result', result)
  if (result?.st) {
    getTools()
  }

  if (result?.address) {
    walletAddress.value = result.address
  }


  if (result?.wt) {
    walletToken.value = result.wt
  }


  if (result?.chainId) {
    chainId.value = result.chainId


  }



  chrome.storage.onChanged.addListener(function (changes, namespace) {
    console.log('changes', changes, namespace)
    if (changes?.st?.newValue) {
      console.log('changes.address.newValue', changes.st.newValue)
      getTools()

    }

    if (changes?.wt) {
      console.log('changes.wt.newValue', changes.wt.newValue)
      walletToken.value = changes.wt.newValue
    }

    if (changes?.address) {
      console.log('changes.address.newValue', changes.address.newValue)
      walletAddress.value = changes.address.newValue
    }

    if (changes?.chainId) {
      console.log('changes.chainId.newValue', changes.chainId.newValue)
      chainId.value = changes.chainId.newValue
      if (!checkChainId(chainId.value)) {
        currentTools.value = 0
        rewardType.value = ''
      }
    }

  });

  // console.log('walletToken', walletToken)
  // if (!walletToken.value) {
  //     connect()
  // }


})
//  reward watchEffect
watchEffect(() => {

  if (!rewardType.value) {
    rewardStatus.value = 0
  }

  if (rewardType.value === 'none') {
    rewardStatus.value = 3
  }

  if (rewardType.value === 'token') {

    const { type, distribution, tokenInfo, tokenNum, quantity } = tokenRewardForm

    if (!type || !distribution || !tokenInfo.tokenName || !tokenNum || !quantity) {
      rewardStatus.value = 1
    }
  }

  if (rewardType.value === 'nft') {

    const { nftName, nftAddress, nftIds, type } = nftRewardForm

    if (!nftName || !nftAddress || !nftIds.length || !type) {
      rewardStatus.value = 1
    }


  }


})

// eligibility watchEffect
watchEffect(() => {

  if (scoreStatus.value === 1 || whitelistStatus.value === 1) {
    eligibilityStatus.value = 1
  }

  if ((scoreStatus.value === 2 && whitelistStatus.value !== 1) || (scoreStatus.value !== 1 && whitelistStatus.value === 2)) {
    eligibilityStatus.value = 2
  }


  if (eligibilityType.value === 'none') {
    eligibilityStatus.value = 3
    scoreStatus.value = 0
    whitelistStatus.value = 0
  }


})

// mission watchEffect
watchEffect(() => {
  if (twitterStatus.value === 1) {
    missionStatus.value = 1
  }

  if (twitterStatus.value === 2) {
    missionStatus.value = 2
  }

  if (missionType.value === 'none') {
    missionStatus.value = 3
    twitterStatus.value = 0
  }

})

// arena watchEffect
watchEffect(() => {
  if (reSearchStatus.value === 1) {
    arenaStatus.value = 1
  }

  if (reSearchStatus.value === 2) {
    arenaStatus.value = 2
  }

  if (arenaType.value === 'none') {
    arenaStatus.value = 3
    reSearchStatus.value = 0
  }
})

const tokenList = ref<{ [key: string]: string }[]>([

])

const nftOptions = [
  {
    value: '123131******323123',
    label: 'NFT Name1132123132',
  },
  {
    value: '223122******123231',
    label: 'NFT Name2',

  },
]

const nftList = ref([{ isChecked: false }, { isChecked: false }, { isChecked: true }, { isChecked: false }, { isChecked: true }, { isChecked: false }, { isChecked: true }, { isChecked: false }, { isChecked: true }, { isChecked: false }, { isChecked: true }, { isChecked: false }, { isChecked: true }, { isChecked: false }, { isChecked: true }, { isChecked: false }, { isChecked: true }])

const formatStartTime = computed(() => {
  if (!startTime.value) return ''
  return moment(startTime.value).format('DD/MM/YYYY hh:mm')
  
})

const formatEndTime = computed(() => {
  if (!endTime.value) return ''
  return moment(endTime.value).format('DD/MM/YYYY hh:mm')
})

const mainSubmitStatus = computed(() => {

  if (rewardStatus.value === 1 || eligibilityStatus.value === 1 || missionStatus.value === 1 || arenaStatus.value === 1) return false

  if (!campaign.value || !startTime.value || !endTime.value) return false

  if (mainErrMsg.campaignErr || mainErrMsg.startTimeErr || mainErrMsg.endTimeErr) return false

  return true
})

const getTools = () => {
  Promise.all([getReward(), getEligibility(), getGaming(), getMission()]).then(res => {

    console.log(res)

  }).catch(err => { console.log(err) })
}

const mainValidate = (fieldName: string) => {

  switch (fieldName) {
    case 'startTime':
      if (!startTime.value) {
        mainErrMsg.startTimeErr = 'Please select a start time!'
      } else {
        timeValidate()
      }
      break;
    case 'endTime':
      if (!endTime.value) {
        mainErrMsg.endTimeErr = 'Please select a end time!'
      } else {
        timeValidate()
      }

      break;
    case 'campaign':
      if (!campaign.value) {
        mainErrMsg.campaignErr = 'Please enter the Campaign name!'
      } else {
        mainErrMsg.campaignErr = ''
      }

      break;
    default:
      break;
  }
};

const timeValidate = () => {

  if (startTime.value) {
    if (endTime.value && (startTime.value.valueOf() as number >= (endTime.value.valueOf() as number))) {
      mainErrMsg.startTimeErr = 'The start time cannot be greater than or equal to the end time!'
    } else {
      mainErrMsg.startTimeErr = ''
    }
  }

  if (endTime.value) {
    if ((endTime.value.valueOf() as number <= new Date().valueOf())) {
      mainErrMsg.endTimeErr = 'The end time must be greater than the current time(utc)!'
    } else if (startTime.value && (startTime.value.valueOf() as number >= (endTime.value.valueOf() as number))) {
      mainErrMsg.endTimeErr = 'The end time cannot be less than or equal to the start time!'
    } else {
      mainErrMsg.endTimeErr = ''
    }
  }

}

const toggleTool = (i: number) => {

  if (i === 1) {
    if (!walletToken.value) {
      sendChromeMessage('connect-wallet')
      return
    }
    if (!checkChainId(chainId.value)) {

      sendChromeMessage('show-connect-wallet')
      return
    }

    if (rewardStatus.value === 2) {
      rewardSteps.value = 4
    } else {
      rewardSteps.value = 0
    }

  } else if (i === 2) { eligibilitySteps.value = 0 }
  else if (i === 3) { missionSteps.value = 0 }
  else if (i === 4) { arenaSteps.value = 0 }



  currentTools.value = i
}

const toggleRewardType = (i: string) => {

  rewardType.value = i

  if ((i === 'token' && (rewardStatus.value > 0 && tokenRewardForm.type))
    || (i === 'nft' && (rewardStatus.value > 0 && nftRewardForm.type))) {
    isShowContinueConfirm.value = true
  }

  if (i === 'token') {
    getWalletTokenBalance()
  }

  if (i !== 'none') {
    rewardSteps.value = 1
  }


}

const rewardSubmit = () => {

  if (rewardType.value === 'token') {

    const { tokenInfo, tokenNum, quantity } = tokenRewardForm

    if (!tokenInfo.tokenName) {
      tokenErrMsg.tokenNameErr = 'Please select Token!'
      return
    } else {
      tokenErrMsg.tokenNameErr = ''
    }

    if (!tokenNum || !Number(tokenNum)) {
      tokenErrMsg.tokenNumErr = 'Please enter the correct amount!'
      return
    } else {
      tokenErrMsg.tokenNumErr = ''
    }

    if (Number(tokenNum) > Number(tokenInfo.tokenQuantity)) {
      tokenErrMsg.tokenNumErr = 'Insufficient wallet balance！'
      return
    } else {
      tokenErrMsg.tokenNumErr = ''
    }


    if (!quantity || !Number(quantity)) {
      tokenErrMsg.quantityErr = 'Please enter the correct winners!'
      return
    } else {
      tokenErrMsg.quantityErr = ''
    }

  }


  if (rewardType.value === 'nft') {

    const { nftIds, nftAddress } = nftRewardForm

    if (!nftAddress) {
      nftErrMsg.nftAddressErr = 'Please select NFT contract!'
      return
    } else {
      nftErrMsg.nftAddressErr = ''
    }

    if (!nftIds.length) {
      nftErrMsg.nftIdsErr = 'Please select at least one NFT!'
      return
    } else {
      nftErrMsg.nftIdsErr = ''

    }


  }


  rewardStatus.value = 2

  rewardSteps.value = 4
}

const toggleMissionType = (i: string) => {
  missionType.value = i

  if (i === 'twitter') {

    if (twitterStatus.value > 0) {
      isShowContinueConfirm.value = true
    }
    if (twitterStatus.value !== 2) {

      twitterStatus.value = 1
    }
  }

  if (i !== 'none') {
    missionSteps.value = 1
  }
}

const toggleEligibilityType = (i: string) => {
  eligibilityType.value = i

  if (i === 'score') {

    if (scoreStatus.value > 0) {
      isShowContinueConfirm.value = true
    }
    if (scoreStatus.value !== 2) {

      scoreStatus.value = 1
    }
  }

  if (i === 'whitelist') {

    if (whitelistStatus.value > 0) {
      isShowContinueConfirm.value = true
    }
    if (whitelistStatus.value !== 2) {

      whitelistStatus.value = 1
    }
  }

  if (i !== 'none') {
    eligibilitySteps.value = 1
  }
}

const toggleArenaType = (i: string) => {
  arenaType.value = i
  if (i === 'reSearch') {

    if (reSearchStatus.value > 0) {
      isShowContinueConfirm.value = true
    }
    if (reSearchStatus.value !== 2) {

      reSearchStatus.value = 1
    }
  }

  if (i !== 'none') {
    arenaSteps.value = 1
  }
}

const rewardBack = () => {
  if (rewardSteps.value === 4) {
    rewardSteps.value = 0
    return false
  }
  if (rewardSteps.value === 0) return
  rewardSteps.value--
}

const missionBack = () => {

  if (missionSteps.value === 0) return
  missionSteps.value--
}

const eligibilityBack = () => {
  if (eligibilitySteps.value === 6) {
    eligibilitySteps.value = 0
    return false
  }
  if (eligibilitySteps.value === 0) return
  eligibilitySteps.value--
}

const arenaBack = () => {
  if (arenaSteps.value === 2) {
    arenaSteps.value = 0
    return false
  }

  if (arenaSteps.value === 0) return
  arenaSteps.value--
}

const rewardNext = () => {
  console.log(tokenList)
  if (rewardType.value === 'token') {
    if (rewardSteps.value === 1) {

      if (!tokenRewardForm.type) {
        tokenErrMsg.typeErr = 'Please select a type！'
        return
      } else {
        tokenErrMsg.typeErr = ''
      }

    } else if (rewardSteps.value === 2) {

      if (!tokenRewardForm.distribution) {
        tokenErrMsg.distributionErr = 'Please select a Distribution！'
        return
      } else {
        tokenErrMsg.distributionErr = ''
      }

    }

  }


  if (rewardType.value === 'nft') {

    if (rewardSteps.value === 1) {

      if (!nftRewardForm.type) {
        nftErrMsg.typeErr = 'Please select a type！'
        return
      } else {
        nftErrMsg.typeErr = ''
      }

    }

  }

  rewardSteps.value++


}

const eligibilityNext = () => {
  if (eligibilityType.value === "score") {
    switch (eligibilitySteps.value) {
      case 1:
        if (!eligibilityForm.score.assetsScore.status) {
          scoreErrMsg.assetsScoreErr = "Please select Asset Score!";
          return;
        } else {
          scoreErrMsg.assetsScoreErr = "";
        }
        break;

      case 2:
        if (!eligibilityForm.score.socialScore.status) {
          scoreErrMsg.socialScoreErr = "Please select Influence!";
          return;
        } else {
          scoreErrMsg.socialScoreErr = "";
        }
        break;

      case 3:
        if (!eligibilityForm.score.luckyScore.status) {
          scoreErrMsg.luckyScoreErr = "Please select Luckiness!";
          return;
        } else {
          scoreErrMsg.luckyScoreErr = "";
        }
        break;

      case 4:
        if (!eligibilityForm.score.activeScore.status) {
          scoreErrMsg.activeScoreErr = "Please select Activeness!";
          return;
        } else {
          scoreErrMsg.activeScoreErr = "";
        }
        break;

      default:
        break;
    }
  }

  eligibilitySteps.value++;
};

const eligibilitySubmit = () => {

  if (eligibilityType.value === 'score') {


    if (!eligibilityForm.score.totalScore.status) {

      scoreErrMsg.totalScoreErr = 'Please select Total!'

      return
    } else {

      scoreErrMsg.totalScoreErr = ''

    }
    scoreStatus.value = 2
  }

  if (eligibilityType.value === 'whitelist') {

    if (whitelistErrMsg.value || !eligibilityForm.whitelist.length) {

      whitelistErrMsg.value = 'Please upload the whitelist address in the correct format!'

      return
    } else {

      whitelistErrMsg.value = ''

    }

    whitelistStatus.value = 2
  }
  eligibilitySteps.value = 6

}

const addNft = (i: number) => {
  nftList.value[i].isChecked = !nftList.value[i].isChecked
}

const searchTwUser = (queryString: string, cb: (arg: any) => void) => {
  console.log('queryString', queryString)
  if (!queryString) {
    cb([])
    return
  }

  searchUserByUsername({ userName: queryString })
    .then((res) => {
      console.log(res);
      cb(res.data ? [{ ...res.data }] : [])
    })
    .catch((err) => {
      console.log(err);
      cb([])
    });


}

const deleteFollow = (i: number) => {
  missionForm.follow.splice(i, 1)
}

const missionSubmit = () => {

  if (missionType.value === 'twitter') {

    const { like, retweet, follow } = missionForm
    if (!like && !retweet && !follow.length) {

      missionErr.twitterErr = 'At least one mission needs to be opened！'

      return

    } else {

      missionErr.twitterErr = ''

    }

    twitterStatus.value = 2

    closeOtherDialog()

  }

}

const addfollow = (item: TwUserInfo) => {
  if (missionForm.follow.length >= 3) return
  missionForm.follow.push(item)
}

const addQuestion = () => {
  questionList.value.push({
    question: "",
    questionErr: "",
    answerOne: "",
    answerOneErr: "",
    answerOneFlag: true,
    answerTwo: "",
    answerTwoErr: "",
    answerTwoFlag: false,
    answerThree: "",
    answerThreeErr: "",
    answerThreeFlag: false
  })
}

const deleteQuestion = (i: number) => {
  questionList.value.splice(i, 1)
}

const arenaSubmit = () => {
  if (arenaType.value === 'reSearch') {

    if (!questionList.value.length) {
      questionErr.value = 'It takes at least one question!'
      return
    } else {
      questionErr.value = ''
    }


    for (let i = 0; i < questionList.value.length; i++) {
      const v = questionList.value[i];
      if (!v.question) {
        v.questionErr = 'Please enter a question！'
        return
      } else {
        v.questionErr = ''
      }
      if (!v.answerOne) {
        v.answerOneErr = 'Please enter option A!'
        return
      } else {
        v.answerOneErr = ''
      }
      if (!v.answerTwo) {
        v.answerTwoErr = 'Please enter option B!'
        return
      } else {
        v.answerTwoErr = ''
      }
      if (!v.answerThree) {
        v.answerThreeErr = 'Please enter option C!'
        return
      } else {
        v.answerThreeErr = ''
      }
    }

    console.log(questionList)

  }
  reSearchStatus.value = 2
  arenaSteps.value = 2
}

const showClear = () => {
  isShowClearConfirm.value = true
}

const hide = () => {
  sendChromeMessage('hide-airdrop-iframe')
  reset()
}

const clearAll = () => {
  // currentTools  
  // 1 reward
  // 2 eligibility
  // 3 mission
  // 4 arena

  // rewardType : token , nft
  // eligibilityType : whitelist , score
  // missionType : twitter
  // arenaType : reSearch

  if (currentTools.value === 1) {

    if (rewardType.value === 'token') {
      tokenRewardForm.distribution = 0
      tokenRewardForm.type = 0
      tokenRewardForm.tokenInfo = {
        tokenName: '',
        tokenAddress: ''
      }
      tokenRewardForm.tokenNum = ''
      tokenRewardForm.quantity = null
    }

    if (rewardType.value === 'nft') {

      nftRewardForm.nftName = ''
      nftRewardForm.nftAddress = ''
      nftRewardForm.nftIds = []
      nftRewardForm.type = ''

    }

    if (!isShowContinueConfirm.value) {
      rewardType.value = ''
      rewardSteps.value = 0
    }

  }
  else if (currentTools.value === 2) {

    if (eligibilityType.value === 'whitelist') {
      eligibilityForm.whitelist = []
    }

    if (eligibilityType.value === 'score') {
      eligibilityForm.score.totalScore.score = 0
      eligibilityForm.score.assetsScore.score = 0
      eligibilityForm.score.luckyScore.score = 0
      eligibilityForm.score.socialScore.score = 0
      eligibilityForm.score.activeScore.score = 0

      eligibilityForm.score.totalScore.status = 0
      eligibilityForm.score.assetsScore.status = 0
      eligibilityForm.score.luckyScore.status = 0
      eligibilityForm.score.socialScore.status = 0
      eligibilityForm.score.activeScore.status = 0

      scoreStatus.value = 1

    }
    if (!isShowContinueConfirm.value) {
      eligibilityType.value = ''
      eligibilitySteps.value = 0
    }

  }
  else if (currentTools.value === 3) {

    if (missionType.value === 'twitter') {
      missionForm.follow = []
      missionForm.like = false
      missionForm.retweet = false
      twitterStatus.value = 1

    }
    if (!isShowContinueConfirm.value) {
      missionType.value = ''
      missionSteps.value = 0
    }

  }
  else if (currentTools.value === 4) {

    if (arenaType.value === 'reSearch') {
      questionList.value = [
        {
          question: "",
          questionErr: "",
          answerOne: "",
          answerOneErr: "",
          answerOneFlag: true,
          answerTwo: "",
          answerTwoErr: "",
          answerTwoFlag: false,
          answerThree: "",
          answerThreeErr: "",
          answerThreeFlag: false
        }
      ]

      reSearchStatus.value = 1
      if (!isShowContinueConfirm.value) {
        arenaType.value = ''
        arenaSteps.value = 0
      }
    }

  }

  isShowContinueConfirm.value = false

  isShowClearConfirm.value = false

}

const closeOtherDialog = () => {
  currentTools.value = 0
}

const continueModify = () => {

  isShowContinueConfirm.value = false

}

const submit = () => {
  if (!mainSubmitStatus.value) return

  const data: Activity = {
    activityName: campaign.value,
    startTime: Number(startTime.value.valueOf()) / 1000,
    endTime: Number(endTime.value.valueOf()) / 1000,
    chainName: "BSC",
    tools: {}
  }

  if (rewardType.value && rewardType.value !== 'none') {
    data.tools.reward = rewardType.value === 'token' ? tokenRewardForm : nftRewardForm
  }

  if (rewardType.value === 'token') {
    tokenRewardForm.tokenName = tokenRewardForm.tokenInfo.tokenName
    tokenRewardForm.quantity = Number(tokenRewardForm.quantity)
    data.tools.reward = tokenRewardForm

  } else if (rewardType.value === 'nft') {

    data.tools.reward = nftRewardForm

  }

  if (eligibilityStatus.value === 2) {
    data.tools.eligibility = eligibilityForm
  }

  if (missionStatus.value === 2) {
    data.tools.mission = missionForm
  }

  if (arenaStatus.value === 2) {
    data.tools.gaming = questionList.value
  }
  isLoading.value = true
  currentTools.value = 0
  sendGiveawayActivity(data).then(res => {

    if (rewardType.value === 'token' && tokenRewardForm.type === 1) {

      sendChromeMessage('send-token-giveaway', {walletAddress:walletAddress.value, activityId: res.data, data }, (result) => {
        isLoading.value = false
        console.log(result, 'token giveaway result')
        if (result.status === 0) {

          reset()

        } else {


          showMessage({ message: 'Send transaction failed!', type: 'error' })

        }


      })

    } else if (rewardType.value === 'nft') {

      isLoading.value = false

      sendChromeMessage('send-nft-giveaway', { activityId: res.data, data })

    } else {

      isLoading.value = false

      sendChromeMessage('send-tweet', res.data)
      reset()

    }

    console.log(res)

  }).catch(err => {
    console.log(err)
    showMessage({ message: err.msg, type: 'error' })
  })


}

const reset = () => {


  rewardType.value = ''
  eligibilityType.value = ''
  missionType.value = ''
  arenaType.value = ''
  rewardStatus.value = 0
  eligibilityStatus.value = 0
  scoreStatus.value = 0
  whitelistStatus.value = 0
  missionStatus.value = 0
  twitterStatus.value = 0
  arenaStatus.value = 0
  reSearchStatus.value = 0
  startTime.value = ''
  endTime.value = ''
  campaign.value = ''
  tokenRewardForm.distribution = 0
  tokenRewardForm.type = 0
  tokenRewardForm.tokenName = ''
  tokenRewardForm.tokenInfo = {
    tokenName: '',
    tokenAddress: ''
  }
  tokenRewardForm.tokenNum = ''
  tokenRewardForm.quantity = null
  nftRewardForm.nftName = ''
  nftRewardForm.nftAddress = ''
  nftRewardForm.nftIds = []
  nftRewardForm.type = ''
  eligibilityForm.score.totalScore.score = 0
  eligibilityForm.score.assetsScore.score = 0
  eligibilityForm.score.luckyScore.score = 0
  eligibilityForm.score.socialScore.score = 0
  eligibilityForm.score.activeScore.score = 0
  eligibilityForm.score.totalScore.status = 0
  eligibilityForm.score.assetsScore.status = 0
  eligibilityForm.score.luckyScore.status = 0
  eligibilityForm.score.socialScore.status = 0
  eligibilityForm.score.activeScore.status = 0
  eligibilityForm.whitelist = []
  missionForm.follow = []
  missionForm.like = false
  missionForm.retweet = false
  questionList.value = [
    {
      question: "",
      questionErr: "",
      answerOne: "",
      answerOneErr: "",
      answerOneFlag: true,
      answerTwo: "",
      answerTwoErr: "",
      answerTwoFlag: false,
      answerThree: "",
      answerThreeErr: "",
      answerThreeFlag: false
    }
  ]
}

const uploadWhitelistSuccess = ({ addressArr }) => {
  console.log('upload whitelist success', addressArr)

  for (let index = 0; index < addressArr.length; index++) {
    const address = addressArr[index];
    if (!Web3.utils.isAddress(address)) {
      whitelistErrMsg.value = 'Error in address！'
      return
    }
  }
  whitelistErrMsg.value = ''
  eligibilityForm.whitelist = addressArr
}

const uploadWhitelistError = () => {
  console.log('upload whitelist error')
  whitelistErrMsg.value = 'Whitelist upload failed！'

}

const noWhitelist = () => {
  eligibilitySteps.value = 0
  eligibilityType.value = 'none'
}

const tokenSelectChange = (item) => {

  tokenRewardForm.tokenInfo = item

}

const getWalletTokenBalance = () => {

  sendChromeMessage('get-wallet-balance', { address: walletAddress.value, chainId: chainId.value }, (result) => {

    if (result.status === 0) {

      console.log('result', result)

      tokenList.value = result.data

    } else {

      showMessage({ message: 'Failed to get wallet balance!', type: 'error' })

    }


  })


}

</script>

<template>
  <main class="absolute top-5% left-50% -translate-x-50%  z-2 w-600px  " @click.stop>

    <div class="main-dialog" v-loading="isLoading">

      <div class="main-header">
        <div class="close" i-mdi-close @click="hide"></div>
        <div class="title">STEP1</div>
        <div class="btn " :class="mainSubmitStatus ? '' : 'btn-disable'" @click="submit">Submit</div>
      </div>

      <div class="main-container">
        <div class="row">
          <div class="row-label">Campaign:</div>
          <input type="text" class="row-input" :class="mainErrMsg.campaignErr ? 'error-border' : ''"
            v-model.trim="campaign" @blur="mainValidate('campaign')" placeholder="Step1 NFT Airdrop">
        </div>
        <div class="error-msg justify-end mt-10px" v-if="mainErrMsg.campaignErr">
          <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
          {{ mainErrMsg.campaignErr }}
        </div>
        <div class="row">
          <div class="row-label">Start Time:</div>
          <div class="row-date-picker">
            <ElDatePicker v-model="startTime" type="datetime" :editable="false" @change="mainValidate('startTime')"
              @blur="mainValidate('startTime')" :clearable="false" />
            <div class="row-input flex justify-between items-center"
              :class="mainErrMsg.startTimeErr ? 'error-border' : ''">
              <input type="text" class="" v-model="formatStartTime" placeholder="Pick a Start Time">
              <img src="../../assets/date-icon.png" class="w-16px h-16px" alt="">
            </div>
          </div>
        </div>
        <div class="error-msg justify-end mt-10px" v-if="mainErrMsg.startTimeErr">
          <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
          {{ mainErrMsg.startTimeErr }}
        </div>
        <div class="row">
          <div class="row-label">End Time:</div>
          <div class="row-date-picker">
            <ElDatePicker v-model="endTime" type="datetime" :editable="false" @change="mainValidate('endTime')"
              @blur="mainValidate('endTime')" :clearable="false" />
            <div class="row-input flex justify-between items-center" :class="mainErrMsg.endTimeErr ? 'error-border' : ''">
              <input type="text" class="" v-model="formatEndTime" placeholder="Pick a End Time">
              <img src="../../assets/date-icon.png" class="w-16px h-16px" alt="">
            </div>

          </div>

        </div>
        <div class="error-msg justify-end mt-10px" v-if="mainErrMsg.endTimeErr">
          <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
          {{ mainErrMsg.endTimeErr }}
        </div>
        <div class="text-14px text-#0F1419 mt-17px">Other Tools:</div>

        <div class="other-tools">
          <div class="item" v-ripple :class="currentTools === 1 ? 'item-active' : ''" @click="toggleTool(1)">
            <img src="../../assets/reward-icon.png" class="item-icon" alt="">
            <div class="item-title">Reward</div>
            <img v-if="rewardStatus === 1" src="../../assets/status-uncomplete.png" class="w-16px h-16px ml-4px" alt="">
            <img v-if="rewardStatus === 2" src="../../assets/status-completed.png" class="w-16px h-16px ml-4px" alt="">
            <img v-if="rewardStatus === 3" src="../../assets/status-not-set.png" class="w-16px h-16px ml-4px" alt="">

          </div>


          <div class="item" v-ripple :class="currentTools === 2 ? 'item-active' : ''" @click="toggleTool(2)">
            <img src="../../assets/eligibility-icon.png" class="item-icon" alt="">
            <div class="item-title">Eligibility</div>
            <img v-if="eligibilityStatus === 1" src="../../assets/status-uncomplete.png" class="w-16px h-16px ml-4px"
              alt="">
            <img v-if="eligibilityStatus === 2" src="../../assets/status-completed.png" class="w-16px h-16px ml-4px"
              alt="">
            <img v-if="eligibilityStatus === 3" src="../../assets/status-not-set.png" class="w-16px h-16px ml-4px" alt="">
          </div>


          <div class="item" v-ripple :class="currentTools === 3 ? 'item-active' : ''" @click="toggleTool(3)">
            <img src="../../assets/mission-icon.png" class="item-icon" alt="">
            <div class="item-title">Mission</div>
            <img v-if="missionStatus === 1" src="../../assets/status-uncomplete.png" class="w-16px h-16px ml-4px" alt="">
            <img v-if="missionStatus === 2" src="../../assets/status-completed.png" class="w-16px h-16px ml-4px" alt="">
            <img v-if="missionStatus === 3" src="../../assets/status-not-set.png" class="w-16px h-16px ml-4px" alt="">

          </div>


          <div class="item " v-ripple :class="currentTools === 4 ? 'item-active' : ''" @click="toggleTool(4)">
            <img src="../../assets/arena-icon.png" class="item-icon" alt="">
            <div class="item-title">Arena</div>
            <img v-if="arenaStatus === 1" src="../../assets/status-uncomplete.png" class="w-16px h-16px ml-4px" alt="">
            <img v-if="arenaStatus === 2" src="../../assets/status-completed.png" class="w-16px h-16px ml-4px" alt="">
            <img v-if="arenaStatus === 3" src="../../assets/status-not-set.png" class="w-16px h-16px ml-4px" alt="">

          </div>
        </div>

      </div>

      <div class="main-footer">
        Set rewards to encourage user participation.
      </div>

    </div>

    <div class="other-dialog" :class="currentTools ? 'show-other-dialog' : ''">

      <div class="reward" v-if="currentTools === 1">

        <div class="other-header" v-if="rewardSteps === 0">
          <div class="title">
            <img src="../../assets/reward-icon.png" class="item-icon" alt="">
            Reward
          </div>
          <div class="close" i-mdi-close @click="closeOtherDialog"></div>
        </div>

        <div class="other-header2" v-if="rewardSteps !== 0">
          <div class="back" i-fa6-solid-arrow-left-long @click="rewardBack"></div>
          <div class="title" v-if="rewardType === 'token'">
            <img src="../../assets/token-award-title-icon.png" alt="">
            Token
          </div>

          <div class="title" v-if="rewardType === 'nft'">
            <img src="../../assets/nft-award-title-icon.png" alt="">
            NFT
          </div>

          <div class="close" i-mdi-close @click="closeOtherDialog"></div>
        </div>

        <div class="other-container" :class="rewardSteps !== 0 ? 'pb-75px' : ''">

          <template v-if="rewardSteps === 0">

            <div class="type-item relative" v-ripple :class="rewardType === 'token' ? 'type-item-active' : ''"
              @click="toggleRewardType('token')">
              <img src="../../assets/token-award-icon-active.png" alt="" v-if="rewardType === 'token'">
              <img src="../../assets/token-award-icon.png" alt="" v-else>
              Token
              <div class="absolute" style="right:-60px" v-if="rewardType === 'token'">
                <img v-if="rewardStatus === 1" src="../../assets/status-uncomplete.png" class="w-16px h-16px" alt="">
                <img v-if="rewardStatus === 2" src="../../assets/status-completed.png" class="w-16px h-16px" alt="">
              </div>
            </div>

            <div class="type-item relative" v-ripple :class="rewardType === 'nft' ? 'type-item-active' : ''"
              @click="toggleRewardType('nft')">
              <img src="../../assets/nft-award-icon-active.png" alt="" v-if="rewardType === 'nft'">
              <img src="../../assets/nft-award-icon.png" alt="" v-else>
              NFT
              <div class="absolute" style="right:-60px" v-if="rewardType === 'nft'">
                <img v-if="rewardStatus === 1" src="../../assets/status-uncomplete.png" class="w-16px h-16px" alt="">
                <img v-if="rewardStatus === 2" src="../../assets/status-completed.png" class="w-16px h-16px" alt="">
              </div>
            </div>

            <div class="type-item2 " style="width:60px" @click="toggleRewardType('none')">Not set</div>

            <div class="type-footer">
              <div>Only one reward method can be selected for one activity.</div>
              <div>Reward-related rules.</div>
            </div>

          </template>

          <template v-if="rewardSteps === 1">

            <template v-if="rewardType === 'token'">
              <div class="flex justify-start items-start pl-72px mt-20px">
                <div class="text-14px text-#0F1419 mr-18px mt-6px">Type:</div>
                <ElRadioGroup v-model="tokenRewardForm.type" class="flex flex-col items-start justify-start">
                  <ElRadio :label="1" size="large">Lucky Draw</ElRadio>
                  <ElRadio :label="2" size="large"> Automatic Distribution at the End</ElRadio>
                </ElRadioGroup>
              </div>
              <div class="error-msg pl-72px flex-start" v-if="tokenErrMsg.typeErr">
                <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
                {{ tokenErrMsg.typeErr }}
              </div>

            </template>

            <template v-if="rewardType === 'nft'">
              <div class="flex justify-start items-start pl-72px mt-20px">
                <div class="text-14px text-#0F1419 mr-18px mt-6px">Type:</div>
                <ElRadioGroup v-model="nftRewardForm.type" class="flex flex-col items-start justify-start">
                  <ElRadio label="1" size="large">Lucky Draw</ElRadio>
                  <ElRadio label="2" size="large">Automatic Distribution at the End</ElRadio>
                  <ElRadio label="3" size="large">Special Offers
                  </ElRadio>
                </ElRadioGroup>
              </div>
              <div class="error-msg pl-72px flex-start" v-if="nftErrMsg.typeErr">
                <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
                {{ nftErrMsg.typeErr }}
              </div>

            </template>

          </template>

          <template v-if="rewardSteps === 2">

            <template v-if="rewardType === 'token'">
              <div class="flex justify-start items-start pl-72px mt-20px">
                <div class="text-14px text-#0F1419 mr-18px mt-6px"> Distribution:</div>
                <ElRadioGroup v-model="tokenRewardForm.distribution" class="flex flex-col items-start justify-start">
                  <ElRadio :label="1" size="large">Equally</ElRadio>
                  <ElRadio :label="2" size="large">Randomly</ElRadio>
                </ElRadioGroup>
              </div>
              <div class="error-msg pl-72px flex-start" v-if="tokenErrMsg.distributionErr">
                <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
                {{ tokenErrMsg.distributionErr }}
              </div>

            </template>

            <template v-if="rewardType === 'nft'">
              <div class="flex justify-between items-center mt-20px w-456px mx-auto " id="nft">
                <div class="text-14px text-#0F1419;"> NFT Contract:</div>
                <ElSelect v-model="nftRewardForm.nftAddress" size="small"
                  :class="nftErrMsg.nftAddressErr ? 'error-item' : ''">
                  <ElOption v-for="item in nftOptions" :key="item.value" :label="item.label" :value="item.value">
                    <span style="float: left" class="mr-10px">{{ item.label }}</span>
                    <span style=" float: right;  color: var(--el-text-color-secondary);  font-size: 13px;  ">{{ item.value
                    }}</span>
                  </ElOption>
                </ElSelect>
              </div>
              <div class="error-msg  justify-end mt-10px px-72px" v-if="nftErrMsg.nftAddressErr">
                <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
                {{ nftErrMsg.nftAddressErr }}
              </div>


              <div class="nft-content" :class="nftErrMsg.nftIdsErr ? 'error-border' : ''">
                <!-- <div class="nft-item" v-for="(item, index) in nftRewardForm.nftIds" :key="index" @click="addNft(index)">
                                                                                                                                                                                                                                                                                        <ElCheckbox v-model="item" size="large" @click.stop />
                                                                                                                                                                                                                                                                                        <img src="" alt="">
                                                                                                                                                                                                                                                                                      </div> -->
              </div>
              <div class="error-msg  justify-end mt-10px px-72px" v-if="nftErrMsg.nftIdsErr">
                <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
                {{ nftErrMsg.nftIdsErr }}
              </div>




            </template>

          </template>

          <template v-if="rewardSteps === 3">

            <div class="w-456px mx-auto " v-if="rewardType === 'token'">
              <div class="row mt-20px">
                <div class="row-label">Token:</div>
                <ElSelect :model-value="tokenRewardForm.tokenInfo" value-key="tokenAddress" size="small"
                  @change="tokenSelectChange" :class="tokenErrMsg.tokenNameErr ? 'error-item' : ''">
                  <ElOption v-for="item in tokenList" :key="item.tokenAddress" :label="item.tokenName" :value="item">
                    <span style="float: left">{{ item.tokenName }}</span>
                    <span style="  float: right; color: var(--el-text-color-secondary);font-size: 13px; ">{{
                      item.tokenQuantity }}</span>
                  </ElOption>
                </ElSelect>
              </div>

              <div class="error-msg  justify-end mt-10px" v-if="tokenErrMsg.tokenNameErr">
                <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
                {{ tokenErrMsg.tokenNameErr }}
              </div>

              <div class="row">
                <div class="row-label">Amount:</div>
                <input type="text" v-model.trim="tokenRewardForm.tokenNum" class="row-input row-input-border"
                  :class="tokenErrMsg.tokenNumErr ? 'error-border' : ''">
              </div>

              <div class="error-msg justify-end mt-10px" v-if="tokenErrMsg.tokenNumErr">
                <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
                {{ tokenErrMsg.tokenNumErr }}
              </div>

              <div class="row ">
                <div class="row-label">Winners:</div>
                <input type="text" v-model.trim="tokenRewardForm.quantity" class="row-input row-input-border"
                  :class="tokenErrMsg.quantityErr ? 'error-border' : ''">
              </div>
              <div class="error-msg justify-end mt-10px" v-if="tokenErrMsg.quantityErr">
                <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
                {{ tokenErrMsg.quantityErr }}
              </div>

            </div>
          </template>

          <template v-if="rewardSteps === 4">

            <div class="w-456px mx-auto mt-10px" v-if="rewardType === 'token'">

              <div class="text-row">
                <div class="left">Type:</div>
                <div class="right">
                  {{ tokenRewardForm.type === 1 ? 'Lucky Draw' : 'Automatic Distribution at the End' }}
                  <div i-mdi-square-edit-outline class="icon" @click="rewardSteps = 1"></div>
                </div>
              </div>

              <div class="text-row">
                <div class="left">Distribution:</div>
                <div class="right">
                  {{ tokenRewardForm.distribution === 1 ? 'Equally' : 'Randomly' }}
                  <div i-mdi-square-edit-outline class="icon" @click="rewardSteps = 2"></div>
                </div>
              </div>

              <div class="text-row">
                <div class="left">Token:</div>
                <div class="right">
                  {{ tokenRewardForm.tokenInfo.tokenName }}
                  <div i-mdi-square-edit-outline class="icon" @click="rewardSteps = 3"></div>
                </div>
              </div>

              <div class="text-row">
                <div class="left">Amount:</div>
                <div class="right">
                  {{ tokenRewardForm.tokenNum }}
                  <div i-mdi-square-edit-outline class="icon" @click="rewardSteps = 3"></div>
                </div>
              </div>

              <div class="text-row">
                <div class="left">Quantity:</div>
                <div class="right">
                  {{ tokenRewardForm.quantity }}
                  <div i-mdi-square-edit-outline class="icon" @click="rewardSteps = 3"></div>
                </div>
              </div>

            </div>

            <div class="w-456px mx-auto mt-10px" v-if="rewardType === 'nft'">

              <div class="text-row">
                <div class="left">Type:</div>
                <div class="right">Lucky Draw
                  <div i-mdi-square-edit-outline class="icon" @click="rewardSteps = 1"></div>
                </div>
              </div>

              <div class="text-row">
                <div class="left">NFT Contract:</div>
                <div class="right">NFT Name 0x14asdf***9143
                </div>
              </div>


              <div class="text-row">
                <div class="left">Quantity:</div>
                <div class="right">12
                </div>
              </div>

              <div class="nft-content">
                <div class="nft-item" v-for="(item, index) in nftList" :key="index" @click="addNft(index)">
                  <ElCheckbox v-model="item.isChecked" size="large" @click.stop />
                  <img src="" alt="">
                </div>
              </div>


            </div>
          </template>


          <div class="next-btn" v-ripple v-if="rewardSteps === 1 || rewardSteps === 2" @click="rewardNext">
            Step
            <div i-fa6-solid-arrow-right-long></div>
          </div>

          <div class="absolute bottom-20px right-20px"
            v-if="(rewardType === 'token' && rewardSteps === 3) || (rewardType === 'nft' && rewardSteps === 2)">
            <div class="submit-btn" v-ripple @click="rewardSubmit">
              Submit
            </div>

          </div>

          <div class="clear-btn" v-ripple v-if="rewardSteps === 4" @click="showClear">
            Clear All
          </div>

        </div>

      </div>

      <div class="eligibility" v-if="currentTools === 2">

        <div class="other-header" v-if="eligibilitySteps === 0">
          <div class="title">
            <img src="../../assets/eligibility-icon.png" class="item-icon" alt="">
            Eligibility
          </div>
          <div class="close" i-mdi-close @click="closeOtherDialog"> </div>
        </div>

        <div class="other-header2" v-if="eligibilitySteps !== 0">
          <div class="back" i-fa6-solid-arrow-left-long @click="eligibilityBack"></div>

          <div class="title" v-if="eligibilityType === 'whitelist'">
            <img src="../../assets/whitelist-title-icon.png" alt="">
            WhiteList
          </div>


          <div class="title" v-if="eligibilityType === 'score'">
            <img src="../../assets/score-title-icon.png" alt="">
            Score
          </div>

          <div class="close" i-mdi-close @click="closeOtherDialog"></div>
        </div>

        <div class="other-container" :class="eligibilitySteps !== 0 ? 'pb-75px' : ''">
          <template v-if="eligibilitySteps === 0">
            <div class="type-item" v-ripple :class="eligibilityType === 'whitelist' ? 'type-item-active' : ''"
              @click="toggleEligibilityType('whitelist')">
              <img src="../../assets/whitelist-icon-active.png" alt="" v-if="eligibilityType === 'whitelist'">
              <img src="../../assets/whitelist-icon.png" v-else alt="">
              WhiteList
              <div class="absolute" style="right:-60px">
                <img v-if="whitelistStatus === 1" src="../../assets/status-uncomplete.png" class="w-16px h-16px" alt="">
                <img v-if="whitelistStatus === 2" src="../../assets/status-completed.png" class="w-16px h-16px" alt="">
              </div>
            </div>

            <div class="type-item type-item-disable" v-ripple
              :class="eligibilityType === 'projectAsset' ? 'type-item-active' : ''">
              <!-- @click="toggleMissionType('discord')" -->
              <img src="../../assets/asset-icon.png" alt="">
              Project Asset
            </div>

            <div class="type-item" v-ripple :class="eligibilityType === 'score' ? 'type-item-active' : ''"
              @click="toggleEligibilityType('score')">

              <!-- <img src="../../assets/score-icon-active.png" alt="" v-if="eligibilityType === 'score'"> -->
              <img src="../../assets/score-icon.png" alt="">
              Score
              <div class="absolute" style="right:-60px">
                <img v-if="scoreStatus === 1" src="../../assets/status-uncomplete.png" class="w-16px h-16px" alt="">
                <img v-if="scoreStatus === 2" src="../../assets/status-completed.png" class="w-16px h-16px" alt="">
              </div>
            </div>

            <div class="type-item2" @click="toggleEligibilityType('none')">Alleligibility</div>

            <div class="type-footer">
              <div>Different types of eligibility could be stacked and applied.</div>
            </div>


          </template>

          <template v-if="eligibilitySteps === 1">

            <div class="w-456px mt-20px mx-auto " v-if="eligibilityType === 'score'">

              <div class="w-100% flex flex-col justify-start items-start">
                <ElSlider v-model="eligibilityForm.score.assetsScore.score" :max="12000" placement="bottom"
                  size="small" />
                <div class="w-100% flex justify-between items-center text-13px text-#536471">
                  <span>0</span>
                  <span>12000</span>
                </div>
              </div>

              <div class="flex justify-start items-start mt-14px">
                <div class="text-14px text-#0F1419 mr-18px mt-6px">Asset Score:</div>
                <ElRadioGroup v-model="eligibilityForm.score.assetsScore.status"
                  class="flex flex-col items-start justify-start">
                  <ElRadio :label="1" size="large">Required</ElRadio>
                  <ElRadio :label="2" size="large">Not Limit
                  </ElRadio>
                </ElRadioGroup>
              </div>
              <div class="error-msg  flex-start" v-if="scoreErrMsg.assetsScoreErr">
                <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
                {{ scoreErrMsg.assetsScoreErr }}
              </div>
            </div>
          </template>

          <template v-if="eligibilitySteps === 2">

            <div class="w-456px mt-20px mx-auto " v-if="eligibilityType === 'score'">

              <div class="w-100% flex flex-col justify-start items-start">
                <ElSlider v-model="eligibilityForm.score.socialScore.score" :max="12000" placement="bottom"
                  size="small" />
                <div class="w-100% flex justify-between items-center text-13px text-#536471">
                  <span>0</span>
                  <span>12000</span>
                </div>
              </div>

              <div class="flex justify-start items-start mt-14px">
                <div class="text-14px text-#0F1419 mr-18px mt-6px">Influence:</div>
                <ElRadioGroup v-model="eligibilityForm.score.socialScore.status"
                  class="flex flex-col items-start justify-start">
                  <ElRadio :label="1" size="large">Required</ElRadio>
                  <ElRadio :label="2" size="large">Not Limit
                  </ElRadio>
                </ElRadioGroup>
              </div>
              <div class="error-msg  flex-start" v-if="scoreErrMsg.socialScoreErr">
                <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
                {{ scoreErrMsg.socialScoreErr }}
              </div>
            </div>
          </template>

          <template v-if="eligibilitySteps === 3">

            <div class="w-456px mt-20px mx-auto " v-if="eligibilityType === 'score'">

              <div class="w-100% flex flex-col justify-start items-start">
                <ElSlider v-model="eligibilityForm.score.luckyScore.score" :max="12000" placement="bottom" size="small" />
                <div class="w-100% flex justify-between items-center text-13px text-#536471">
                  <span>0</span>
                  <span>12000</span>
                </div>
              </div>

              <div class="flex justify-start items-start mt-14px">
                <div class="text-14px text-#0F1419 mr-18px mt-6px">Luckiness:</div>
                <ElRadioGroup v-model="eligibilityForm.score.luckyScore.status"
                  class="flex flex-col items-start justify-start">
                  <ElRadio :label="1" size="large">Required</ElRadio>
                  <ElRadio :label="2" size="large">Not Limit
                  </ElRadio>
                </ElRadioGroup>
              </div>
              <div class="error-msg flex-start" v-if="scoreErrMsg.luckyScoreErr">
                <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
                {{ scoreErrMsg.luckyScoreErr }}
              </div>
            </div>
          </template>

          <template v-if="eligibilitySteps === 4">

            <div class="w-456px mt-20px mx-auto " v-if="eligibilityType === 'score'">

              <div class="w-100% flex flex-col justify-start items-start">
                <ElSlider v-model="eligibilityForm.score.activeScore.score" :max="12000" placement="bottom"
                  size="small" />
                <div class="w-100% flex justify-between items-center text-13px text-#536471">
                  <span>0</span>
                  <span>12000</span>
                </div>
              </div>

              <div class="flex justify-start items-start mt-14px">
                <div class="text-14px text-#0F1419 mr-18px mt-6px">Activeness:</div>
                <ElRadioGroup v-model="eligibilityForm.score.activeScore.status"
                  class="flex flex-col items-start justify-start">
                  <ElRadio :label="1" size="large">Required</ElRadio>
                  <ElRadio :label="2" size="large">Not Limit
                  </ElRadio>
                </ElRadioGroup>
              </div>
              <div class="error-msg flex-start" v-if="scoreErrMsg.activeScoreErr">
                <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
                {{ scoreErrMsg.activeScoreErr }}
              </div>
            </div>
          </template>

          <template v-if="eligibilitySteps === 5">

            <div class="w-456px mt-20px mx-auto " v-if="eligibilityType === 'score'">

              <div class="w-100% flex flex-col justify-start items-start">
                <ElSlider v-model="eligibilityForm.score.totalScore.score" :max="12000" placement="bottom" size="small" />
                <div class="w-100% flex justify-between items-center text-13px text-#536471">
                  <span>0</span>
                  <span>12000</span>
                </div>
              </div>

              <div class="flex justify-start items-start mt-14px">
                <div class="text-14px text-#0F1419 mr-18px mt-6px">Total:</div>
                <ElRadioGroup v-model="eligibilityForm.score.totalScore.status"
                  class="flex flex-col items-start justify-start">
                  <ElRadio :label="1" size="large">Required</ElRadio>
                  <ElRadio :label="2" size="large">Not Limit
                  </ElRadio>
                </ElRadioGroup>
              </div>
              <div class="error-msg  flex-start" v-if="scoreErrMsg.totalScoreErr">
                <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
                {{ scoreErrMsg.totalScoreErr }}
              </div>
            </div>
          </template>

          <template v-if="eligibilitySteps === 6">


            <div class="w-456px mt-20px mx-auto " v-if="eligibilityType === 'score'">

              <div class="w-100% flex  justify-between items-center">
                <div class="text-14px text-#0F1419 w-85px">Asset Score:</div>
                <div class="w-312px">
                  <ElSlider v-model="eligibilityForm.score.assetsScore.score" :max="12000" placement="bottom"
                    size="small" />
                </div>
                <div class="text-13px text-#536471">12000</div>
              </div>

              <ElRadioGroup v-model="eligibilityForm.score.assetsScore.status"
                class="flex  justify-start items-center  pl-88px">
                <ElRadio :label="1" size="large">Required</ElRadio>
                <ElRadio :label="2" size="large">Not Limit
                </ElRadio>
              </ElRadioGroup>

              <div class="w-100% flex  justify-between items-center mt-10px">
                <div class="text-14px text-#0F1419 w-85px">Influence:</div>
                <div class="w-312px">
                  <ElSlider v-model="eligibilityForm.score.socialScore.score" :max="12000" placement="bottom"
                    size="small" />
                </div>
                <div class="text-13px text-#536471">12000</div>
              </div>

              <ElRadioGroup v-model="eligibilityForm.score.socialScore.status"
                class="flex  justify-start items-center  pl-88px">
                <ElRadio :label="1" size="large">Required</ElRadio>
                <ElRadio :label="2" size="large">Not Limit
                </ElRadio>
              </ElRadioGroup>


              <div class="w-100% flex  justify-between items-center mt-10px">
                <div class="text-14px text-#0F1419 w-85px">Luckiness:</div>
                <div class="w-312px">
                  <ElSlider v-model="eligibilityForm.score.luckyScore.score" :max="12000" placement="bottom"
                    size="small" />
                </div>
                <div class="text-13px text-#536471">12000</div>
              </div>

              <ElRadioGroup v-model="eligibilityForm.score.luckyScore.status"
                class="flex  justify-start items-center  pl-88px">
                <ElRadio :label="1" size="large">Required</ElRadio>
                <ElRadio :label="2" size="large">Not Limit
                </ElRadio>
              </ElRadioGroup>

              <div class="w-100% flex  justify-between items-center mt-10px">
                <div class="text-14px text-#0F1419 w-85px">Activeness:</div>
                <div class="w-312px">
                  <ElSlider v-model="eligibilityForm.score.activeScore.score" :max="12000" placement="bottom"
                    size="small" />
                </div>
                <div class="text-13px text-#536471">12000</div>
              </div>

              <ElRadioGroup v-model="eligibilityForm.score.activeScore.status"
                class="flex  justify-start items-center  pl-88px">
                <ElRadio :label="1" size="large">Required</ElRadio>
                <ElRadio :label="2" size="large">Not Limit
                </ElRadio>
              </ElRadioGroup>


              <div class="w-100% flex  justify-between items-center mt-10px">
                <div class="text-14px text-#0F1419 w-85px">Total:</div>
                <div class="w-312px">
                  <ElSlider v-model="eligibilityForm.score.totalScore.score" :max="12000" placement="bottom"
                    size="small" />
                </div>
                <div class="text-13px text-#536471">12000</div>
              </div>

              <ElRadioGroup v-model="eligibilityForm.score.totalScore.status"
                class="flex  justify-start items-center  pl-88px">
                <ElRadio :label="1" size="large">Required</ElRadio>
                <ElRadio :label="2" size="large">Not Limit
                </ElRadio>
              </ElRadioGroup>




            </div>
          </template>

          <template v-if="(eligibilitySteps === 6 || eligibilitySteps === 1) && (eligibilityType === 'whitelist')">
            <UploadExcel :steps="eligibilitySteps" :whitelist="eligibilityForm.whitelist"
              @uploadWhitelistError="uploadWhitelistError" @uploadWhitelistSuccess="uploadWhitelistSuccess" />

            <div class="error-msg   mt-10px pl-74px" v-if="whitelistErrMsg">
              <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
              {{ whitelistErrMsg }}

            </div>

          </template>

          <div class="type-footer absolute bottom-8px left-50%  -translate-x-50% "
            v-if="eligibilityType === 'score' && eligibilitySteps !== 0">
            <div>No limit by default when </div>
            <div style="color:#536471">the scores lide is set to 0, or just click Not Limit.</div>
          </div>

          <div class="type-footer absolute bottom-8px left-50%  -translate-x-50% "
            v-if="eligibilityType === 'whitelist' && eligibilitySteps === 6">
            <div style="border-bottom: 1px solid rgba(83,100,113,0.3);" @click="noWhitelist"> No White List</div>
          </div>

          <div class="next-btn" v-if="eligibilitySteps > 0 && eligibilitySteps < 5" @click="eligibilityNext">
            Step
            <div i-fa6-solid-arrow-right-long></div>
          </div>


          <div class="absolute bottom-20px right-20px" v-ripple
            v-if="(eligibilityType === 'whitelist' && eligibilitySteps !== 0) || (eligibilityType === 'score' && eligibilitySteps === 5)">
            <div class="submit-btn" @click="eligibilitySubmit">
              Submit
            </div>
          </div>

          <div class="clear-btn" v-ripple v-if="eligibilitySteps === 6" @click="showClear">
            Clear All
          </div>

        </div>

      </div>

      <div class="mission" v-if="currentTools === 3">

        <div class="other-header" v-if="missionSteps === 0">
          <div class="title">
            <img src="../../assets/mission-icon.png" class="item-icon" alt="">
            Mission
          </div>
          <div class="close" i-mdi-close @click="closeOtherDialog"></div>
        </div>

        <div class="other-header2" v-if="missionSteps !== 0">
          <div class="back" i-fa6-solid-arrow-left-long @click="missionBack"></div>


          <div class="title">
            <img src="../../assets/mission-icon.png" alt="">
            Mission
          </div>

          <div class="close" i-mdi-close @click="closeOtherDialog"></div>
        </div>

        <div class="other-container" :class="missionSteps !== 0 ? 'pb-75px' : ''">

          <template v-if="missionSteps === 0">
            <div class="type-item" v-ripple :class="missionType === 'twitter' ? 'type-item-active' : ''"
              @click="toggleMissionType('twitter')">
              <img src="../../assets/twitter-icon.png" alt="">
              Twitter

              <div class="absolute" style="right:-60px">
                <img v-if="twitterStatus === 1" src="../../assets/status-uncomplete.png" class="w-16px h-16px" alt="">
                <img v-if="twitterStatus === 2" src="../../assets/status-completed.png" class="w-16px h-16px" alt="">
              </div>
            </div>

            <div class="type-item" v-ripple :class="rewardType === 'discord' ? 'type-item-active' : ''">
              <!-- @click="toggleMissionType('discord')" -->
              <img src="../../assets/discord-icon.png" alt="">
              Discord
            </div>

            <div class="type-item2" @click="toggleMissionType('none')">No Mission</div>

            <div class="type-footer">
              <div>One campaign can only support one type of reward.</div>
              <div>More Related Rules</div>
            </div>


          </template>

          <template v-if="missionSteps === 1">

            <div class="w-465px mx-auto" v-if="missionType === 'twitter'">

              <div class="flex justify-start items-center mt-20px">
                <img src="../../assets/twitter-icon.png" class="w-16px h-16px mr-10px" alt="">
                <div class="text-14px text-#0F1419">Twitter</div>
              </div>

              <div class="w-100% h-40px flex justify-between items-center "
                style="border-bottom: 1px solid rgba(83,100,113,0.3);">
                <div class="text-14px text-#536471">Retweet</div>
                <ElSwitch v-model="missionForm.retweet" size="small" />
              </div>


              <div class="w-100% h-40px flex justify-between items-center"
                style="border-bottom: 1px solid rgba(83,100,113,0.3);">
                <div class="text-14px text-#536471">Like</div>
                <ElSwitch v-model="missionForm.like" size="small" />
              </div>

              <div class="w-100% min-h-65px pt-8px flex flex-col items-start justify-between"
                style="border-bottom: 1px solid rgba(83,100,113,0.3);">
                <div class="flex justify-between items-center w-100% ">
                  <div class="text-14px text-#536471">Follow (3 accounts at max)</div>

                  <div class="w-100px h-24px">
                    <ElAutocomplete :fetch-suggestions="searchTwUser" v-model.trim="searchValue">
                      <template #suffix>
                        <div i-ri-search-line></div>
                      </template>
                      <template #default="{ item }">
                        <div class="flex items-center" @click="addfollow(item)">
                          <ElAvatar :size="25" :src="item.profileImageUrl"></ElAvatar>
                          <div class="ml-10px">{{ item.name }}</div>
                        </div>
                      </template>
                    </ElAutocomplete>
                  </div>

                </div>
                <div class="w-100% flex flex-wrap justify-start items-center mt-14px">

                  <div class="follow-user relative  mb-6px mr-20px text-14px text-#0f1419"
                    v-for="(item, index) in missionForm.follow" :key="index">
                    {{ item.name }}
                    <div class="absolute -top-6px -right-12px text-#1D9BF0 cursor-pointer" i-mdi-close-circle-outline
                      @click="deleteFollow(index)" />
                  </div>


                </div>
              </div>

              <div class="error-msg justify-end mt-10px" v-if="missionErr.twitterErr">
                <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
                {{ missionErr.twitterErr }}
              </div>

            </div>

          </template>

          <div class="absolute bottom-20px right-20px" v-ripple v-if="missionSteps === 1">
            <div class="submit-btn" @click="missionSubmit">
              Submit
            </div>

          </div>

        </div>

      </div>

      <div class="arena" v-if="currentTools === 4">

        <div class="other-header ">
          <div class="back absolute left-20px" i-fa6-solid-arrow-left-long @click="arenaBack" v-if="arenaSteps !== 0">
          </div>

          <div class="title">
            <img src="../../assets/arena-icon.png" class="item-icon" alt="">
            Arena
          </div>
          <div class="close" i-mdi-close @click="closeOtherDialog"></div>
        </div>

        <div class="other-container" :class="arenaSteps !== 0 ? 'pb-75px' : ''">
          <!-- arenaSteps -->
          <!-- arenaType -->
          <template v-if="arenaSteps === 0">

            <div class="type-item" v-ripple :class="arenaType === 'reSearch' ? 'type-item-active' : ''"
              @click="toggleArenaType('reSearch')">
              <img src="../../assets/token-award-icon-active.png" alt="" v-if="arenaType === 'reSearch'">
              <img src="../../assets/token-award-icon.png" alt="" v-else>
              Project Research
              <div class="absolute" style="right:-60px">
                <img v-if="reSearchStatus === 1" src="../../assets/status-uncomplete.png" class="w-16px h-16px" alt="">
                <img v-if="reSearchStatus === 2" src="../../assets/status-completed.png" class="w-16px h-16px" alt="">
              </div>
            </div>

            <div class="type-item2" @click="toggleArenaType('none')">No Arena</div>

            <div class="type-footer w-456px absolute bottom-8px left-50%  -translate-x-50% ">
              <div>The whitelist restriction should not be used in conjunction with the </div>
              <div style="color:#536471">other two conditions.</div>
            </div>


          </template>

          <template v-if="arenaSteps === 1">
            <div class="w-465px mx-auto mt-20px" v-if="arenaType === 'reSearch'">
              <div class="question mb-20px" v-for="(item, index) in questionList" :key="index">
                <div class="flex justify-between items-center">
                  <div class="w-85px text-14px text-#0f1419">Question {{ index + 1 }}:</div>
                  <div class="flex-1"> <input type="text" v-model.trim="item.question"
                      :class="item.questionErr ? 'error-border' : ''"></div>
                  <div i-ep-delete class=" ml-8px text-20px text-#536471 cursor-pointer" @click="deleteQuestion(index)">
                  </div>
                </div>
                <div class="error-msg justify-end mt-10px" v-if="item.questionErr">
                  <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
                  {{ item.questionErr }}
                </div>

                <div class="flex justify-between items-center mt-6px">
                  <div class="w-70px text-14px text-#0f1419">Option A:</div>
                  <div class="flex-1"> <input type="text" v-model.trim="item.answerOne"
                      :class="item.answerOneErr ? 'error-border' : ''"></div>
                  <div class="w-46px ml-20px text-20px text-#536471  flex  justify-between items-center">
                    <div i-ion-checkmark-circle-outline class=" cursor-pointer"
                      :class="item.answerOneFlag ? 'text-blue' : ''" @click="item.answerOneFlag = true"></div>
                    <div i-ion-close-circle-outline class=" cursor-pointer"
                      :class="!item.answerOneFlag ? 'text-blue' : ''" @click="item.answerOneFlag = false"></div>
                  </div>
                </div>
                <div class="error-msg justify-end mt-10px" v-if="item.answerOneErr">
                  <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
                  {{ item.answerOneErr }}
                </div>

                <div class="flex justify-between items-center mt-6px">
                  <div class="w-70px text-14px text-#0f1419">Option B:</div>
                  <div class="flex-1"> <input type="text" :class="item.answerTwoErr ? 'error-border' : ''"
                      v-model.trim="item.answerTwo"></div>
                  <div class="w-46px ml-20px text-20px text-#536471  flex  justify-between items-center">
                    <div i-ion-checkmark-circle-outline class=" cursor-pointer"
                      :class="item.answerTwoFlag ? 'text-blue' : ''" @click="item.answerTwoFlag = true"></div>
                    <div i-ion-close-circle-outline class=" cursor-pointer"
                      :class="!item.answerTwoFlag ? 'text-blue' : ''" @click="item.answerTwoFlag = false"></div>
                  </div>
                </div>
                <div class="error-msg justify-end mt-10px" v-if="item.answerTwoErr">
                  <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
                  {{ item.answerTwoErr }}
                </div>


                <div class="flex justify-between items-center mt-6px">
                  <div class="w-70px text-14px text-#0f1419">Option C:</div>
                  <div class="flex-1"> <input type="text" :class="item.answerThreeErr ? 'error-border' : ''"
                      v-model.trim="item.answerThree"></div>
                  <div class="w-46px ml-20px text-20px text-#536471  flex  justify-between items-center">
                    <div i-ion-checkmark-circle-outline class=" cursor-pointer"
                      :class="item.answerThreeFlag ? 'text-blue' : ''" @click="item.answerThreeFlag = true">
                    </div>
                    <div i-ion-close-circle-outline class=" cursor-pointer"
                      :class="!item.answerThreeFlag ? 'text-blue' : ''" @click="item.answerThreeFlag = false"></div>
                  </div>
                </div>
                <div class="error-msg justify-end mt-10px" v-if="item.answerThreeErr">
                  <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
                  {{ item.answerThreeErr }}
                </div>


              </div>


              <div
                class=" add-question w-140px h-24px flex justify-center items-center text-13px text-#536471 mx-auto  cursor-pointer  transition-all rounded-xl hover:bg-#1D9BF0 hover:bg-opacity-20 pr-10px pl-15px "
                @click="addQuestion">
                <div i-pixelarticons-text-add class="mr-10px text-20px"></div>
                Add Question
              </div>
              <div class="error-msg justify-end mt-10px" v-if="questionErr">
                <div class="error-icon mr-5px" i-system-uicons-warning-triangle></div>
                {{ questionErr }}
              </div>

            </div>
          </template>

          <template v-if="arenaSteps === 2">
            <div class="w-465px mx-auto mt-20px" v-if="arenaType === 'reSearch'">
              <div class="question mb-20px" v-for="(item, index) in questionList" :key="index">
                <div class="flex justify-between items-center">
                  <div class="w-85px text-14px text-#0f1419">Question {{ index + 1 }}:</div>
                  <div class="flex-1"> <input type="text" v-model.trim="item.question"></div>
                  <!-- <div i-ep-delete class=" ml-8px text-20px text-#536471 cursor-pointer" @click="deleteQuestion(index)">
                                                                                                                                                                                                              </div> -->
                </div>

                <div class="flex justify-between items-center mt-6px">
                  <div class="w-70px text-14px text-#0f1419">Option A:</div>
                  <div class="flex-1"> <input type="text" v-model.trim="item.answerOne"></div>
                  <div class="w-46px ml-20px text-20px text-#536471  flex  justify-between items-center">
                    <div i-ion-checkmark-circle-outline class=" cursor-pointer"
                      :class="item.answerOneFlag ? 'text-blue' : ''" @click="item.answerOneFlag = true"></div>
                    <div i-ion-close-circle-outline class=" cursor-pointer"
                      :class="!item.answerOneFlag ? 'text-blue' : ''" @click="item.answerOneFlag = false"></div>
                  </div>
                </div>


                <div class="flex justify-between items-center mt-6px">
                  <div class="w-70px text-14px text-#0f1419">Option B:</div>
                  <div class="flex-1"> <input type="text" v-model.trim="item.answerTwo"></div>
                  <div class="w-46px ml-20px text-20px text-#536471  flex  justify-between items-center">
                    <div i-ion-checkmark-circle-outline class=" cursor-pointer"
                      :class="item.answerTwoFlag ? 'text-blue' : ''" @click="item.answerTwoFlag = true"></div>
                    <div i-ion-close-circle-outline class=" cursor-pointer"
                      :class="!item.answerTwoFlag ? 'text-blue' : ''" @click="item.answerTwoFlag = false"></div>
                  </div>
                </div>


                <div class="flex justify-between items-center mt-6px">
                  <div class="w-70px text-14px text-#0f1419">Option C:</div>
                  <div class="flex-1"> <input type="text" v-model.trim="item.answerThree"></div>
                  <div class="w-46px ml-20px text-20px text-#536471  flex  justify-between items-center">
                    <div i-ion-checkmark-circle-outline class=" cursor-pointer"
                      :class="item.answerThreeFlag ? 'text-blue' : ''" @click="item.answerThreeFlag = true">
                    </div>
                    <div i-ion-close-circle-outline class=" cursor-pointer"
                      :class="!item.answerThreeFlag ? 'text-blue' : ''" @click="item.answerThreeFlag = false"></div>
                  </div>
                </div>

              </div>


            </div>
          </template>

          <div class="absolute bottom-20px right-20px" v-if="arenaSteps === 1">
            <div class="submit-btn" v-ripple @click="arenaSubmit">
              Submit
            </div>

          </div>

          <div class="clear-btn" v-ripple v-if="arenaSteps === 2" @click="showClear">
            Clear All
          </div>

        </div>
      </div>

      <div class="clear-confirm" :class="isShowClearConfirm ? 'show-clear-confirm' : ''">
        <img src="../../assets/clear-warning.png" alt="">
        <div class="text-13px text-#536471 mt-20px">Are you sure to clear all?</div>
        <div class="w-240px flex  justify-between items-center mt-20px">
          <div class="confirm-btn" v-ripple @click="clearAll">YES</div>
          <div class="confirm-btn" v-ripple @click="isShowClearConfirm = false">NO</div>
        </div>
      </div>

      <div class="continue-confirm" :class="isShowContinueConfirm ? 'show-continue-confirm' : ''">
        <img src="../../assets/clear-warning.png" alt="">
        <div class="text-13px text-#536471 mt-20px">Set up failed. Do you want to resume </div>
        <div class="text-13px text-#536471 "> following your previous settings?</div>

        <div class="w-240px flex  justify-between items-center mt-20px">
          <div class="confirm-btn" v-ripple @click="continueModify">YES</div>
          <div class="confirm-btn" v-ripple @click="clearAll">NO</div>
        </div>
      </div>

    </div>

  </main>
</template>

<style lang="scss" scoped>
.main-dialog {
  position: relative;
  width: 600px;
  min-height: 290px;
  background: #FFFFFF;
  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.302);
  border-radius: 14px;
  z-index: 3;
  overflow: hidden;

  .main-header {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 50px;
    padding: 14px 20px 0 20px;

    .close {
      position: absolute;
      top: 18px;
      left: 20px;
      font-size: 28px;
      color: #0F1419;
      font-weight: 700;
      margin-right: 65px;
      cursor: pointer;

    }

    .title {
      font-size: 20px;
      font-weight: 700;
      color: #0F1419;

    }

    .btn {
      position: absolute;
      top: 14px;
      right: 20px;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      width: 85px;
      height: 50px;
      font-size: 15px;
      font-weight: 700;
      color: #fff;
      padding-top: 5px;
      cursor: pointer;
      background: url('~/assets/submit-btn.png');
      background-size: 100% 100%;
    }

    .btn-disable {
      background: url('~/assets/submit-btn-disable.png');
      background-size: 100% 100%;
    }

  }

  .main-container {
    width: 456px;
    margin: 0 auto;



    .other-tools {
      display: flex;
      justify-content: space-around;
      align-items: flex-start;
      margin-top: 10px;

      .item-active {
        background: rgba(29, 155, 240, 0.2);

        .item-title {
          color: #0F1419 !important;

        }
      }

      .item {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        min-width: 96px;
        height: 24px;
        border-radius: 273px;
        padding: 0 10px;
        cursor: pointer;

        .item-title {
          font-size: 13px;
          font-weight: 700;
          color: #536471;
          margin-left: 10px;
        }

        .item-icon {
          width: 16px;
          height: 16px;
        }
      }
    }
  }

  .main-footer {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 456px;
    height: 36px;
    opacity: 1;
    border-top: 1px solid rgba(83, 100, 113, 0.3);
    font-size: 13px;
    font-weight: 400;
    color: #536471;
    margin: 0 auto;
    margin-top: 18px;
  }

}

.other-dialog {
  position: absolute;
  top: 0px;
  left: 0;
  width: 600px;
  min-height: 290px;
  background: #FFFFFF;
  border-radius: 14px;
  z-index: 1;
  opacity: 0;
  padding-top: 48px;
  transition: all .4s ease;

  .show-clear-confirm {
    z-index: 1 !important;
    opacity: 1 !important;
  }

  .clear-confirm {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: #fff;
    border-radius: 14px;
    z-index: -1;
    opacity: 0;
    transition: all .4s;

    .confirm-btn:hover {
      background: rgba(29, 155, 240, 0.2) !important;
      border: 1px solid #1D9BF0 !important;
    }

    .confirm-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 68px;
      height: 32px;
      background: rgba(83, 100, 113, 0.2);
      border-radius: 145px;
      border: 1px solid transparent;
      font-size: 15px;
      font-weight: 700;
      color: #0F1419;
      transition: all .2s;
      cursor: pointer;
    }
  }

  .show-continue-confirm {
    z-index: 1 !important;
    opacity: 1 !important;
  }

  .continue-confirm {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: #fff;
    border-radius: 14px;
    z-index: -1;
    opacity: 0;
    transition: all .4s;

    .confirm-btn:hover {
      background: rgba(29, 155, 240, 0.2) !important;
      border: 1px solid #1D9BF0 !important;
    }

    .confirm-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 68px;
      height: 32px;
      background: rgba(83, 100, 113, 0.2);
      border-radius: 145px;
      border: 1px solid transparent;
      font-size: 15px;
      font-weight: 700;
      color: #0F1419;
      transition: all .2s;
      cursor: pointer;
    }
  }

  .eligibility {
    .type-item {
      width: 154px !important;
    }
  }

  .arena {
    .type-item {
      width: 176px !important;
    }
  }

  .other-header {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 0px 20px 0 20px;

    .title {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 20px;
      font-weight: 700;
      color: #0F1419;

      img {
        width: 16px;
        height: 16px;
        margin-right: 10px;
      }

    }

    .close {
      position: absolute;
      top: 2px;
      right: 20px;
      font-size: 28px;
      color: #0F1419;
      font-weight: 700;
      cursor: pointer;
    }
  }

  .back {
    font-size: 20px;
    color: #0F1419;
    cursor: pointer;
    margin-right: 32px;
  }

  .other-header2 {
    position: relative;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    padding: 0px 20px 0 20px;



    .title {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 20px;
      font-weight: 700;
      color: #0F1419;

      img {
        width: 20px;
        height: 20px;
        margin-right: 10px;
      }

    }

    .close {
      position: absolute;
      top: 2px;
      right: 20px;
      font-size: 28px;
      color: #0F1419;
      font-weight: 700;
      cursor: pointer;
    }
  }

  .other-container {

    .type-item-active {
      background: #1D9BF0 !important;
      color: #fff !important;
    }

    .type-item-disable {
      background: rgba(83, 100, 113, 0.2) !important;
      cursor: auto;
    }

    .type-item {
      position: relative;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      width: 110px;
      height: 24px;
      background: rgba(29, 155, 240, 0.2);
      border-radius: 273px;
      padding: 0 20px;
      font-size: 13px;
      font-weight: 700;
      color: #536471;
      margin: 0 auto;
      margin-top: 20px;
      cursor: pointer;

      img {
        width: 16px;
        height: 16px;
        margin-right: 10px;
      }
    }

    .type-item2 {
      width: 80px;
      opacity: 1;
      border-bottom: 1px solid rgba(83, 100, 113, 0.3);
      font-size: 13px;
      font-weight: 400;
      color: #536471;
      text-align: center;

      margin: 0 auto;
      margin-top: 20px;
      cursor: pointer;
    }

    .type-footer {
      margin-top: 30px;

      div:nth-child(1) {
        font-size: 13px;
        font-weight: 400;
        color: #536471;
        text-align: center;
      }

      div:nth-child(2) {
        font-size: 13px;
        font-weight: 400;
        color: #0F1419;
        text-align: center;

      }

    }

    .next-btn {
      position: absolute;
      bottom: 20px;
      right: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 85px;
      height: 32px;
      background: #1D9BF0;
      border-radius: 145px;
      font-size: 15px;
      font-weight: 700;
      color: #FFFFFF;
      cursor: pointer;

      div {
        padding-top: 4px;
        margin-left: 4px;
      }
    }

    .clear-btn {
      position: absolute;
      bottom: 20px;
      right: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 85px;
      height: 32px;
      background: #1D9BF0;
      border-radius: 145px;
      font-size: 15px;
      font-weight: 700;
      color: #FFFFFF;
      cursor: pointer;

    }

    #nft {

      :deep(.el-input__wrapper),
      :deep(.el-input__inner) {
        width: 226px !important;
      }
    }

    .question {
      input {
        width: 100%;
        height: 24px;
        border-bottom: 1px solid rgba(83, 100, 113, 0.3);
      }
    }


    :deep(.row-date-picker .el-input__wrapper),
    :deep(.row-date-picker .el-input__inner),
    :deep(.el-select .el-input__wrapper) {
      width: 378px !important;
    }

    :deep(.el-autocomplete .el-input__inner) {
      height: 24px !important;
    }

    :deep(.el-slider__bar) {
      background: linear-gradient(90deg, rgb(29, 155, 240) 0%, rgb(0, 255, 189) 100%) !important;
    }

    :deep(.el-slider__button) {
      width: 20px !important;
      height: 20px !important;
      border-color: #fff !important;
      background-color: #1D9BF0 !important;
    }



    .submit-btn-disable {

      background: rgba(83, 100, 113, 0.2) !important;

    }

    .submit-btn {
      width: 85px;
      height: 32px;
      background: #1D9BF0;
      border-radius: 145px;
      font-size: 15px;
      font-weight: 700;
      color: #FFFFFF;
      text-align: center;
      line-height: 32px;
      cursor: pointer;
    }

    .nft-content {
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      flex-wrap: wrap;
      width: 456px;
      height: 200px;
      background: #FFFFFF;
      border-radius: 4px;
      border: 1px solid rgba(83, 100, 113, 0.3);
      padding: 20px;
      padding-right: 4px;
      margin: 0 auto;
      margin-top: 20px;
      overflow-y: auto;

      .nft-item:nth-child(5n) {
        margin-right: 0px;
      }

      .nft-item {
        position: relative;
        width: 68px;
        height: 68px;
        background: #D8D8D8;
        border-radius: 4px 4px 4px 4px;
        margin-right: 18px;
        margin-bottom: 20px;

        .el-checkbox {
          position: absolute;
          top: -10px;
          right: 1px;
        }
      }
    }

  }
}

.row {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  margin-top: 14px;



  .row-label {
    width: 76px;
    text-align: left;
    font-size: 14px;
    font-weight: 400;
    color: #0F1419;

  }

  :deep(.el-date-editor .el-input__wrapper),
  :deep(.el-date-editor .el-input__inner) {
    width: 378px !important;
    opacity: 0;
  }

  .row-date-picker {
    position: relative;
    width: 378px;
    height: 24px;
    overflow: hidden;

    .row-input {
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
      border: 1px solid rgba(83, 100, 113, 0.3);
      border-radius: 4px;

    }
  }

  .row-input-border {
    border: 1px solid rgba(83, 100, 113, 0.3);
    border-radius: 4px;

  }

  .row-input {
    width: 378px;
    height: 24px;
    background: #FFFFFF;
    opacity: 1;
    border-bottom: 1px solid rgba(83, 100, 113, 0.3);
    font-size: 13px;
    font-weight: 400;
    padding: 0 10px 0 5px;
  }


}

:deep(.error-item) {
  .el-input__wrapper {
    box-shadow: 0 0 0 1px #FF4545 inset;
  }

}

.error-border {
  border-color: #FF4545 !important;
}

.error-msg {
  display: flex;
  align-items: center;
  width: 100%;
  font-size: 12px;
  font-weight: 400;
  color: #FF4545;

  .error-icon {
    font-size: 16px;
  }
}

.text-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  color: #0F1419;
  height: 38px;
  border-bottom: 1px solid rgba(83, 100, 113, 0.3);

  .right {
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .icon {
      cursor: pointer;
      margin-left: 10px;
      color: #536471;
      font-size: 16px;
    }
  }
}

:deep(.el-radio-group) {
  align-items: flex-start !important;

}

.show-other-dialog {
  top: 90% !important;
  opacity: 1 !important;

}
</style>
<style>
.el-radio__input.is-checked .el-radio__inner::after {
  transform: translate(-50%, -50%) scale(1) rotate(45deg) !important;
}

.el-radio__input .el-radio__inner::after {
  border: 1px solid #1D9BF0;
  border-left: 0;
  border-top: 0;
  height: 8px !important;
  left: 7px !important;
  top: 6px !important;
  width: 5px !important;
  border-radius: 0px !important;
  background-color: transparent !important;
}

.el-radio.el-radio--large .el-radio__inner {
  width: 16px !important;
  height: 16px !important;
  border: 1px solid #536471 !important;
}

.el-radio__input.is-checked .el-radio__inner {
  border: 1px solid #1D9BF0 !important;
  background: rgba(29, 155, 240, .1)
}

.el-checkbox__input .el-checkbox__inner::after {
  border: 1px solid #1D9BF0;
  border-left: 0;
  border-top: 0;
  height: 6px !important;
  left: 4px !important;
  top: 2px !important;
  width: 4px !important;
  background-color: transparent !important;

}

.el-checkbox.el-checkbox--large .el-checkbox__inner {
  width: 16px !important;
  height: 16px !important;
  border: 1px solid #536471 !important;
  border-radius: 50% !important;
  background-color: transparent !important;

}

.el-checkbox__input.is-checked .el-checkbox__inner {
  border: 1px solid #1D9BF0 !important;
  background-color: transparent !important;
}
</style>