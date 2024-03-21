<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, ref, onBeforeUnmount } from 'vue'
import { useActivityStore } from '../stores'
const activityStore = useActivityStore()

const { activityInfo } = activityStore

const { userRecord, eligibility } = activityInfo

const { userScore } = userRecord

const instance = getCurrentInstance()
const echarts = instance.appContext.config.globalProperties.$echarts;

const scoreChartEle = ref(null)

const scoreChart = ref(null)

onMounted(() => {
    initChart()
})

onBeforeUnmount(() => {
    scoreChart.value.dispose()
})

const initChart = () => {

    scoreChart.value = echarts.init(scoreChartEle.value)
    scoreChart.value.setOption({
        radar: {
            indicator: [
                { max: 2000 },
                { max: 2000 },
                { max: 2000 },
                { max: 2000 },
            ],
            radius: '100%',
            axisLine: {
                lineStyle: {
                    color: '#00ffbd'
                }
            },
            splitNumber: 3,
            splitArea: {
                show: true,
                areaStyle: {
                    color: ['rgba(0,0,0,0)', 'rgba(0,255,189,0.4)', 'rgba(0,0,0,0)']
                }
            },
            splitLine: {
                lineStyle: {
                    color: ['#00FFBD']
                }
            }
        },
        series: [
            {
                type: 'radar',
                tooltip: {
                    trigger: 'item'
                },
                areaStyle: {
                    opacity: 1
                },
                symbol: 'none',
                data: [
                    {
                        value: [1200, 1800, 800, 1000],
                        itemStyle: {
                            color: '#00FFBD'
                        }
                    }
                ]
            }
        ]
    }

    )


}

</script>

<template>
    <div class="score">

        <div class="score-item" :class="userScore.assetsScore < eligibility?.assetsScore ? 'score-not' : ''">
            <div>Asset Score</div>
            <div v-if="eligibility?.assetsStatus && eligibility.assetsStatus === 1">{{ userScore.assetsScore }}/{{
                eligibility.assetsScore }}</div>
            <div v-else>{{ userScore.assetsScore }}</div>
        </div>
        <div class="score-item" :class="userScore.luckyScore < eligibility?.luckyScore ? 'score-not' : ''">
            <div>Luckiness Score</div>
            <div v-if="eligibility?.luckyStatus && eligibility.luckyStatus === 1">{{ userScore.luckyScore }}/{{
                eligibility.luckyScore }}</div>
            <div v-else>{{ userScore.luckyScore }}</div>

        </div>
        <div class="score-item " :class="userScore.activeScore < eligibility?.activeScore ? 'score-not' : ''">
            <div>Activeness Score</div>
            <div v-if="eligibility?.activeStatus && eligibility.activeStatus === 1">{{ userScore.activeScore }}/{{
                eligibility.activeScore }}</div>
            <div v-else>{{ userScore.activeScore }}</div>
        </div>
        <div class="score-item" :class="userScore.socialScore < eligibility?.socialScore ? 'score-not' : ''">
            <div>Influence Score</div>
            <div v-if="eligibility?.socialStatus && eligibility.socialStatus === 1">{{ userScore.socialScore }}/{{
                eligibility.socialScore }}</div>
            <div v-else>{{ userScore.socialScore }}</div>
        </div>
        <div class="score-title">
            <img src="../../../assets/eligibility-white-icon.png" alt="">
            Eligibility
        </div>
        <div class="total" :class="userScore.totalScore < eligibility?.totalScore ? 'score-not' : ''">
            <div>Total</div>
            <div v-if="eligibility?.totalStatus && eligibility.totalStatus === 1">{{ userScore.totalScore }}/{{
                eligibility.totalScore }}</div>
            <div v-else>{{ userScore.totalScore }}</div>
        </div>
        <div class="scroe-chart" ref="scoreChartEle" />
    </div>
</template>
<style lang="scss" scoped>
.score {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 244px;
    margin: 20px 0 10px 0;

    .score-title {
        position: absolute;
        top: -8px;
        left: 0;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        font-size: 15px;
        font-weight: 700;
        color: #FFFFFF;
        line-height: 20px;

        img {
            width: 16px;
            height: 16px;
            margin-right: 10px;
        }
    }

    .total {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 13px;
        font-weight: 700;
        color: #231815;
        line-height: 18px;
        z-index: 2;
    }

    .score-not {

        div:nth-child(1),
        div:nth-child(2) {
            color: #FF4545 !important;
        }


    }

    .score-item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        div:nth-child(1) {

            font-size: 13px;
            font-weight: 700;
            color: #FFFFFF;
            line-height: 18px;
        }

        div:nth-child(2) {
            font-size: 12px;
            font-weight: 400;
            color: #CFCFCF;
            line-height: 16px;
            margin-top: 5px;
        }
    }

    .score-item:nth-child(1) {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translate(-50%, 0);
    }

    .score-item:nth-child(2) {
        position: absolute;
        top: 50%;
        right: 0;
        transform: translate(0, -50%);
    }

    .score-item:nth-child(3) {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translate(-50%, 0);
    }

    .score-item:nth-child(4) {
        position: absolute;
        top: 50%;
        left: 0;
        transform: translate(0, -50%);
    }


    .scroe-chart {
        width: 142px;
        height: 142px;
    }
}</style>