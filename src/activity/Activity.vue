
<script setup lang="ts">
import ActivityBgMask from './components/ActivityBgMask.vue'
import ActivityEntrance from './views/ActivityEntrance.vue'
import ActivityEligibility from './views/ActivityEligibility.vue'
import AcitivityMain from './views/ActivityMain.vue'
import { ref, onMounted, toRefs } from 'vue'
import { useActivityStore } from './stores'
import { getUrlParams } from '../utils/index'

// pageStatus 
// 0 entrance page
// 1 eligibility page
// 2 main page 
const pageStatus = ref<number>(0)

const isLoading = ref<boolean>(false)

const activityStore = useActivityStore()

const { activityInfo, activityTimeStatus } = toRefs(activityStore)

onMounted(() => {

    isLoading.value = true

    let data = getUrlParams(window.location.search)

    activityStore.queryActivityInfo(data.activityId).then(res => {
        console.log(res)

        if (res) {

            pageStatus.value = 2
        } else {
            pageStatus.value = 0
        }

        isLoading.value = false
    })

    chrome.storage.onChanged.addListener(function (changes, namespace) {
        console.log('changes', changes, namespace)

        if (changes?.st?.newValue) {
            console.log('changes.st.newValue', changes.st.newValue)
            refreshData()
        }


    });



})

const refreshData = async () => {
    isLoading.value = true
    let res = await activityStore.queryActivityInfo(activityStore.activityInfo.activity.id)

    if (res) {

        pageStatus.value = 2
    } else {
        pageStatus.value = 0
    }

    isLoading.value = false


}

const togglePage = () => {

    if (pageStatus.value === 2) {
        pageStatus.value = 0
        return
    }
    pageStatus.value += 1
}



const knowEligility = () => {
    pageStatus.value = 2
}

const joinSuccess = async () => {

    await refreshData()

    console.log('activityInfo', activityInfo)
    if (activityInfo.value.eligibility) {
        pageStatus.value = 1
    } else {
        pageStatus.value = 2
    }
}


</script>

<template>
    <div class="activity" v-loading="isLoading" element-loading-background="rgba(0, 0, 0, 0.4)">
        <ActivityBgMask />
        <main>
            <div class="header">
                <div class="header-title">
                    <div class="t">
                        <ElTooltip content="Uncoming" effect="customized" v-if="activityTimeStatus === 0">
                            <img src="../../assets/activity-status-1.png" class="activity-status" alt="">
                        </ElTooltip>

                        <ElTooltip content="OnGoing" effect="customized" v-if="activityTimeStatus === 1">
                            <img src="../../assets/activity-status-2.png" class="activity-status" alt="">
                        </ElTooltip>


                        <ElTooltip content="Ended" effect="customized" v-if="activityTimeStatus === 2">
                            <img src="../../assets/activity-status-3.png" class="activity-status" alt="">
                        </ElTooltip>


                    </div>

                    <div class="eligibility" v-if="pageStatus === 2" @click="pageStatus = 1">
                        <img src="../../assets/eligibility-white-icon.png" alt=""
                            v-if="activityInfo.userRecord.isScore && activityInfo.userRecord.whitelist">
                        <img src="../../assets/eligibility-icon-uncomplete.png" alt="" v-else>
                    </div>
                </div>
                <div class="activity-title">
                    Me waiting for the Seahawks to sign Bobby Wagne
                </div>

            </div>
            <div class="container" v-if="activityStore.activityInfo?.activity?.id">
                <ActivityEntrance v-if="pageStatus === 0" @joinSuccess="joinSuccess" />
                <ActivityEligibility v-if="pageStatus === 1" @knowEligility="knowEligility" />
                <AcitivityMain v-if="pageStatus === 2" />
            </div>
            <div class="footer">
                <div class="chain">Binance Smart Chain Mainnet</div>

            </div>

        </main>
    </div>
</template>

<style lang="scss" scoped>
.activity {
    position: relative;
    width: 400px;
    height: 458px;
    border-radius: 16px;
    overflow: hidden;
    font-family: Oswald-Heavy, Oswald;
    letter-spacing: .5px;
    background-color: #000;

    main {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 3;
        padding-top: 20px;

        .header {
            width: 100%;


            .header-title {
                position: relative;
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;

                .t {
                    position: relative;
                    width: 173px;
                    height: 25px;
                    background: url('../../assets/step1-activity-title.png');
                    background-size: 100% 100%;
                }

                .activity-status {
                    position: absolute;
                    top: 50%;
                    right: -22px;
                    transform: translate(0, -50%);
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                }

                .eligibility {
                    position: absolute;
                    right: 20px;
                    top: 50%;
                    transform: translate(0, -50%);
                    cursor: pointer;
                    width: 16px;
                    height: 16px;

                    img {
                        width: 16px;
                        height: 16px;
                    }
                }

            }

            .activity-title {
                width: 100%;
                font-size: 15px;
                font-family: Oswald-Heavy, Oswald;
                font-weight: 800;
                color: #00FFBD;
                text-align: center;
                line-height: 20px;
                text-shadow: 0px 1px 0px #00C9FF;
                margin-top: 10px;
            }
        }

        .container {}

        .footer {
            display: flex;
            justify-content: center;
            align-items: center;
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translate(-50%, 0);

            .chain {
                font-size: 13px;
                font-weight: 400;
                color: #999999;
                line-height: 18px;
            }
        }
    }


}
</style>
<style>
.el-loading-spinner .path {
    stroke: #00ffbd !important;
}
</style>