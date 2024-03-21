<script setup lang="ts">
import ActivityScroeChart from '../components/ActivityScroeChart.vue';
import { useActivityStore } from '../stores'

const emit = defineEmits<{
    (e: 'knowEligility'): void
}>()

const activityStore = useActivityStore()

const { activityInfo } = activityStore

const { userRecord, eligibility } = activityInfo

const handleClick = () => {
    emit('knowEligility')
}

</script>

<template>
    <div class="px-41px">
        <ActivityScroeChart />

        <div class="whitelist" v-if="eligibility?.whitelist && eligibility.whitelist !== '[]'"
            :class="userRecord.whitelist ? '' : 'close'">
            Whitelist
            <div v-if="userRecord.whitelist" class="check icon" i-mdi-check-outline></div>
            <div v-else class="close icon" i-mdi-close-outline></div>
        </div>
        
        <div v-else class="whitelist">
            Whitelist
            <div class="check icon" i-mdi-check-outline></div>

        </div>
        <div class="guide">
            Eligibility Manual And Guidelines
        </div>
        <div class="btn" @click="handleClick">
            <img src="../../assets/i-know.png" alt="">
        </div>
    </div>
</template>


<style lang="scss" scoped>
.whitelist {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 13px;
    font-weight: 700;
    color: #FFFFFF;
    line-height: 18px;

    .icon {
        font-size: 16px;
        margin-left: 4px;
    }

    .check {
        color: #00FFBD;
    }

    .close {
        color: #FF4545;
    }

}

.guide {
    font-size: 12px;
    font-weight: 400;
    color: #536471;
    line-height: 16px;
    text-align: center;
    margin: 4px 0;
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
    cursor: pointer;
    background: url("../../assets/btn-bg.png") no-repeat;
    background-size: 110% 300%;
    background-position: 50% 110%;
    background-color: #1D9BF0;
    box-shadow: 0px 2px 3px 0px #0068B0;
    transition: all .4s ;

    img {
        width: 54px;
        height: 14px;
    }
}
</style>