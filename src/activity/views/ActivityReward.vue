
<script setup lang="ts">
import { onMounted, computed, toRefs } from 'vue'
import { useActivityStore } from '../stores'
import moment from 'moment'

const activityStore = useActivityStore()
const { activityInfo } = activityStore

const props = defineProps<{
    hasParticipating?: boolean
}>()

const { hasParticipating } = toRefs(props)

onMounted(() => {
    console.log('activityStore', activityStore)
    console.log('activityInfo', activityStore.activityInfo)
})

const hasReward = computed(() => {

    return !!activityInfo?.reward

})
</script>
<template>
    <div class="reward">

        <div class="reward-row" :class="hasReward ? '' : 'none'">
            <div>Token Reward:</div>
            <div class="amount" v-if="hasReward">{{ activityInfo.reward.tokenNum + ' ' + activityInfo.reward.tokenName }}
            </div>
            <div v-else>None</div>
        </div>

        <div class="reward-row" :class="hasReward ? '' : 'none'">
            <div>Winners:</div>
            <div>{{ hasReward ? activityInfo.reward.quantity : 'None' }}</div>
        </div>

        <div class="reward-row" :class="hasReward ? '' : 'none'">
            <div>Distribution:</div>
            <div v-if="!hasReward">None</div>
            <div v-else-if="activityInfo.reward.distribution === 1">Equally</div>
            <div v-else-if="activityInfo.reward.distribution === 2">Randomly</div>
        </div>

        <div class="reward-row" :class="hasReward ? '' : 'none'">
            <div>Form Of Reward:</div>
            <div v-if="!hasReward">None</div>
            <div v-else-if="activityInfo.reward.type === 1">Lucky Draw</div>
            <div v-else-if="activityInfo.reward.type === 2">Automatic Distribution at the End</div>
        </div>

        <div class="reward-row">
            <div>Starting Time:</div>
            <div>{{ moment(activityInfo.activity.startTime).utc().format('DD/MM/YYYY hh:mm') }}</div>
        </div>

        <div class="reward-row">
            <div>Ending Time:</div>
            <div>{{ moment(activityInfo.activity.endTime).utc().format('DD/MM/YYYY hh:mm') }}</div>
        </div>

        <div class="reward-row" v-if="hasParticipating">
            <div>Participating Users:</div>
            <div>{{ activityInfo.participateUser }}</div>
        </div>














    </div>
</template>


<style lang="scss" scoped>
.reward {
    .none {
        color: #536471 !important;
    }

    .reward-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        font-size: 15px;
        font-weight: 800;
        color: #FFFFFF;
        margin-top: 20px;
        line-height: 20px;

        .amount {
            position: relative;
            cursor: pointer;
        }

        .amount::after {
            content: " ";
            position: absolute;
            left: 50%;
            transform: translate(-50%, 0);
            bottom: -2px;
            width: 106%;
            height: 2px;
            background-color: #00FFBD;
        }
    }
}
</style>