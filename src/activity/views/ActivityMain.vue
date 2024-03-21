<script setup lang="ts">
import ActivityTabbar from '../components/ActivityTabbar.vue';
import ActivityMission from './ActivityMission.vue'
import ActivityArena from './ActivityArena.vue'
import ActivityReward from './ActivityReward.vue'
import { useActivityStore } from '../stores'
import { ref, toRefs, onMounted, computed } from 'vue'

// tabIndex
// 0 mission
// 1 arena
// 2 reward
const tabIndex = ref<number>(2)

const activityStore = useActivityStore()

const { activityInfo, activityTimeStatus } = activityStore

const { rewardStatus, isGetReward } = toRefs(activityInfo.userRecord)


onMounted(() => {

})

const toggleTabInde = (i: number) => {

    tabIndex.value = i
}


</script>

<template>
    <div>
        <ActivityTabbar :tabIndex="tabIndex" @toggleTabIndex="toggleTabInde" />

        <!-- container -->
        <ActivityMission v-show="tabIndex === 0" />
        <ActivityArena v-show="tabIndex === 1" />

        <div class="px-20px" v-show="tabIndex === 2">

            <ActivityReward />

            <!-- 需要判断结束时间  rewardStatus === 0 | 2   -->
            <template v-if="rewardStatus === 0 || rewardStatus === 2">

                <!-- 活动时间结束 acitivityTimeStatus === 2 显示活动已结束 -->
                <div class="error" v-if="activityTimeStatus === 2">
                    Campaign Ended!
                </div>

                <!-- 活动时间未结束  acitivityTimeStatus !== 2 :  判断活动领取状态 rewardStatus -->
                <template v-else>

                    <!-- rewardStatus === 0 显示领取按钮 -->
                    <div class="btn" v-if="rewardStatus === 0">
                        <img src="../../../assets/claim.png" style="width: 41px;height:15px ;" alt="">
                    </div>

                    <!-- rewardStatus === 2 显示灰色领取按钮 -->
                    <div class="btn-disable" v-else-if="rewardStatus === 2">
                        <img src="../../../assets/claim-white.png" style="width: 41px;height:15px ;" alt="">
                    </div>

                </template>


            </template>

            <!--  不需要判断结束时间 rewardStatus === 1 | 3 | 4 | 5  -->
            <template v-else>

                <!-- rewardStatus === 1 显示领取成功 -->
                <div class="success" v-if="rewardStatus === 1">
                    Reward Claimed!
                </div>

                <!-- rewardStatus === 3 显示等待项目方发放奖励 -->
                <div class="btn-disable" v-else-if="rewardStatus === 3">
                    <img src="../../../assets/wait-white.png" style="width: 189px;height:15px ;" alt="">
                </div>

                <!-- rewardStatus === 4 项目方已发放奖励 需判断 isGetReward -->
                <template v-else-if="rewardStatus === 4">

                    <!-- isGetReward === true  显示对应钱包已经接收到奖励 -->
                    <div class="success" v-if="isGetReward">
                        Rewarded!
                    </div>

                    <!-- isGetReward === false 显示没有领取到奖励 -->
                    <div class="error" v-else>
                        Not Rewarded!
                    </div>

                </template>

                <!-- rewardStatus === 5 显示完成了 -->
                <div class="success" v-else-if="rewardStatus === 5">
                    Complete Successfuled!
                </div>

            </template>

        </div>
        <!-- container -->

    </div>
</template>


<style lang="scss" scoped>
.error {
    font-size: 31px;
    font-weight: 700;
    color: #FF4545;
    line-height: 42px;
    text-align: center;
    margin-top: 10px;
}

.success {
    font-size: 31px;
    font-weight: 700;
    color: #00FF04;
    line-height: 42px;
    text-align: center;
    margin-top: 10px;
}

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
    margin-top: 20px;
    cursor: pointer;
    background: url("../../assets/btn-bg.png") no-repeat;
    background-size: 110% 300%;
    background-position: 50% 110%;
    background-color: #1D9BF0;
    box-shadow: 0px 2px 3px 0px #0068B0;
    transition: all .4s;

}

.btn-disable:hover {
    background-position: 50% 50% !important;
    box-shadow: 0px 0px 16px 0px #CFCFCF;
}

.btn-disable {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 320px;
    height: 32px;
    border-radius: 236px;
    margin: 0 auto;
    margin-top: 20px;
    cursor: pointer;
    background: url("../../assets/btn-bg2.png") no-repeat;
    background-size: 110% 300%;
    background-position: 50% 110%;
    background-color: #536471;
    box-shadow: 0px 2px 3px 0px #536471;
    transition: all .4s;

}
</style>

