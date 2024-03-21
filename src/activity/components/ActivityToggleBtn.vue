<script setup lang="ts">
import { toRefs, ref } from 'vue';
import { useActivityStore } from '../stores'
import { showMessage } from '../../utils/message';
import { checkUserTwitterTask } from '../../api/activitys'
const props = defineProps<{
    toggleStatus: boolean,
    type: number
}>()

// toggleStatus
// false refresh
// true check 

const { toggleStatus, type } = toRefs(props)
const activityStore = useActivityStore()

const { activityInfo } = toRefs(activityStore)

const isAni = ref<boolean>(false)

const refresh = () => {

    isAni.value = true
    checkUserTwitterTask({ activityId: activityInfo.value.activity.id, tweetId: activityInfo.value.activity.tweetId, type: type.value }).then(async res => {
        console.log('res', res)
        if (res.data?.result || res.data?.like || res.data?.follow) {
            await activityStore.refreshActivityInfo()
        }
        isAni.value = false


    })
        .catch(err => {
            console.log(err)
            isAni.value = false

            showMessage({ message: err.msg, type: 'error' })
        })

}
</script>

<template>
    <img v-if="!toggleStatus" src="../../../assets/refresh-icon.png" class="refresh" :class="isAni ? 'refresh-in' : ''"
        alt="" @click="refresh">
    <div v-else class="check " i-mdi-check-outline></div>
</template>

<style lang="scss" scoped>
.refresh {
    width: 16px;
    height: 16px;
    cursor: pointer;
}

.refresh-in {
    animation: rotate 1s infinite;
}

@keyframes rotate {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}


.check {
    font-size: 16px;

    color: #00FFBD;
}
</style>   