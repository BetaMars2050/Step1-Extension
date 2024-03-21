<script setup lang="ts">
import { useActivityStore } from '../stores'
import { toRefs, onMounted, computed } from 'vue'

const activityStore = useActivityStore()

const { stepBgStatus } = toRefs(activityStore)


</script>
<template>
    <div class="bg-mask"></div>
    <div class="step" v-if="stepBgStatus">
    </div>
</template>

<style lang="scss" scoped>
.bg-mask {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;
    background: url('../../assets/activity-bg1.png');
    background-size: 100% 100%;
    animation: rotate 180s linear infinite;
    filter: blur(4px);
}

.step {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 272px;
    height: 349px;
    background: url('../../../assets/step.png') no-repeat center;
    background-size: cover;
    z-index: 2;

}

@keyframes rotate {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>