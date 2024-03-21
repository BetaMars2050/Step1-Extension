
<script setup lang="ts">
import { useActivityStore } from '../stores'
import { toRefs } from 'vue';


const activityStore = useActivityStore()
const { activityInfo } = activityStore
const props = defineProps<{
    tabIndex: number
}>()

const emit = defineEmits<{
    (e: 'toggleTabIndex', i: number): void
}>()

const { tabIndex } = toRefs(props)

const toggle = (i: number) => {
    emit('toggleTabIndex', i)
}


</script>

<template>
    <div class="tab ">
        <div class="tab-item" :class="tabIndex === 0 ? 'tab-active' : ''" @click="toggle(0)"
            v-if="activityInfo.mission.length">
            <img src="../../../assets/mission-white-icon.png" alt="">
            Mission
        </div>

        <div class="tab-item tab-disable" v-else>
            <img src="../../../assets/mission-icon-not.png" alt="">
            Mission
        </div>
        <div class="dashed"></div>

        <div class="tab-item" :class="tabIndex === 1 ? 'tab-active' : ''" @click="toggle(1)"
            v-if="activityInfo.gaming.length">
            <img src="../../../assets/arena-white-icon.png" alt="">
            Arena
        </div>

        <div class="tab-item tab-disable" v-else>
            <img src="../../../assets/arena-icon-not.png" alt="">
            Arena
        </div>
        <div class="dashed"></div>
        <div class="tab-item " :class="tabIndex === 2 ? 'tab-active' : ''" @click="toggle(2)">
            <img src="../../../assets/reward-white-icon.png" alt="">
            Reward
        </div>

    </div>
</template>

<style scoped lang="scss">
.tab {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 360px;
    height: 44px;
    border-bottom: 1px solid #fff;
    margin: 0 auto;
    margin-top: 10px;

    .dashed {
        width: 42px;
        height: 0;
        border-bottom: 1px dashed #FFFFFF;
    }

    .tab-active {
        background: rgba(0, 255, 189, 0.2);
        border-bottom: 1px solid #00FFBD !important;
        color: #00FFBD !important;

    }

    .tab-disable {
        color: #536471 !important
    }

    .tab-item {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 86px;
        height: 24px;
        padding: 0 10px;
        font-size: 13px;
        font-weight: 700;
        color: #FFFFFF;
        line-height: 18px;
        cursor: pointer;
        border-radius: 273px;
        border-bottom: 1px solid transparent;
        transition: all .4s;

        img {
            width: 16px;
            height: 16px;
            margin-right: 10px;
        }
    }
}
</style>