<script setup lang="ts">
import { onMounted, toRefs } from 'vue'
import { useActivityStore } from '../stores'
import ActivityReward from './ActivityReward.vue'
import { saveParticipate } from '../../api/activitys'
import { showMessage } from '../../utils/message'

const emit = defineEmits<{
    (e: 'joinSuccess'): void
}>()

const activityStore = useActivityStore()

const { activityInfo, activityTimeStatus } = toRefs(activityStore)

onMounted(() => {
    console.log('activityStore', activityStore)
    console.log('activityInfo', activityStore.activityInfo)
})

const join = async () => {

    let result = await chrome.storage.local.get(["st"])
    console.log(result)
    if (!result?.st) {
        window.open(
            "https://twitter.com/i/oauth2/authorize?response_type=code&client_id=TkE5Q25VSThyaURpbHgtd2NjaHA6MTpjaQ&redirect_uri=https://test1.step1matrix.io/auth&scope=tweet.read offline.access users.read follows.read space.read mute.read like.read list.read block.read bookmark.read&state=state&code_challenge=challenge&code_challenge_method=plain"
        );
        return
    }

    saveParticipate({ activityId: activityInfo.value.activity.id }).then(res => {
        console.log(res)
        emit('joinSuccess')
    }).catch(err => {
        console.log(err)
        showMessage({ message: err.msg, type: 'error' })
    })
}

</script>

<template>
    <div class="activity-entrance">
        <ActivityReward hasParticipating />


        <div class="btn" v-if="activityTimeStatus === 0">
            <img src="../../assets/sub-now.png" style="width:119px;height: 16px;" alt="">
        </div>

        <div class="btn" @click="join" v-else-if="activityTimeStatus === 1">

            <img src="../../assets/join-now.png" alt="">
        </div>
        <div class="end" v-else-if="activityTimeStatus === 2">
            Campaign Ended!
        </div>
    </div>
</template>

<style lang="scss" scoped>
.activity-entrance {
    padding: 0 41px;

    .btn:hover {
        background-position: 50% 50% !important;
        box-shadow: 0px 0px 16px 0px #00FFBD;

    }

    .btn {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        width: 320px;
        height: 32px;
        border-radius: 236px;
        margin: 0 auto;
        margin-top: 35px;
        cursor: pointer;
        background: url("../../assets/btn-bg.png") no-repeat;
        background-size: 110% 300%;
        background-position: 50% 110%;
        background-color: #1D9BF0;
        box-shadow: 0px 2px 3px 0px #0068B0;
        transition: all .4s ;

        img {

            width: 71px;
            height: 15px;

        }
    }

    .end {
        font-size: 31px;
        font-weight: 700;
        color: #FF4545;
        line-height: 42px;
        margin: 0 auto;
        margin-top: 20px;
        text-align: center;
    }

}
</style>