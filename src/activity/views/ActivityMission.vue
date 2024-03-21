
<script setup lang="ts">
import ActivityToggleBtn from '../components/ActivityToggleBtn.vue';
import { ref, toRefs } from 'vue'
import { useActivityStore } from '../stores'

const activityStore = useActivityStore()

const { activityInfo } = toRefs(activityStore)




</script>

<template>
    <div class="mission" v-if="activityInfo.mission.length">
        <div class="mission-row" v-if="activityInfo.mission[0].retweet">
            <div>Retweet</div>
            <ActivityToggleBtn :type="1" :toggleStatus="activityInfo.userRecord.userMisson.retweet" />
        </div>

        <div class="mission-row" v-if="activityInfo.mission[0].support">
            <div>Like</div>
            <ActivityToggleBtn :type="2" :toggleStatus="activityInfo.userRecord.userMisson.like" />

        </div>

        <div class="mission-row" v-if="activityInfo.mission[0].follow && activityInfo.mission[0].follow !== '[]'">
            <div>Follow</div>
            <ActivityToggleBtn :type="3" :toggleStatus="activityInfo.userRecord.userMisson.follow" />
        </div>
        <div class="follow" v-if="activityInfo.mission[0].follow && activityInfo.mission[0].follow !== '[]'">
            <a :href="`https://twitter.com/${item.username}`" target="_blank" class="follow-item"
                v-for="item in JSON.parse(activityInfo.mission[0].follow)" :key="item.id">
                {{ '@' + item.username }}
                <img src="../../../assets/follow-check-icon.png" alt=""
                    v-if="activityInfo.userRecord.userMisson.followMap[item.id]">
                <img src="../../../assets/follow-icon.png" alt="" v-else>
            </a>
        </div>
        <div class="line"></div>
        <div class="bottom">

            <div class="btn" v-if="!activityInfo.userRecord.isMission">
                <img src="../../assets/complete-white.png" alt="">
            </div>
            <div class="mission-complete" v-else>
                Mission Complete!
            </div>

        </div>

    </div>
</template>

<style lang="scss" scoped>
.mission {
    width: 360px;
    margin: 0 auto;

    .line {
        width: 100%;
        height: 1px;
        background-color: #fff;
        margin-top: 4px;
    }

    .mission-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        font-size: 13px;
        font-weight: 400;
        color: #FFFFFF;
        line-height: 18px;
        margin-top: 20px;
    }

    .follow {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-top: 20px;

        .follow-item:hover {
            color: #00FFBD;
        }

        .follow-item {
            display: flex;
            justify-content: flex-end;
            align-items: center;

            margin-left: 24px;
            font-size: 13px;
            font-weight: 400;
            color: #FFFFFF;
            cursor: pointer;
            transition: all .4s;

            img {
                width: 16px;
                height: 16px;
                margin-left: 4px;
            }
        }
    }

    .bottom {

        position: absolute;
        bottom: 36px;
        left: 50%;
        transform: translate(-50%, 0);

        .mission-complete {
            font-size: 20px;
            font-weight: 700;
            color: #00FFBD;
            line-height: 27px;
            text-align: center;
        }

        .btn:hover {
            background-position: 50% 50% !important;
            box-shadow: 0px 0px 16px 0px #CFCFCF;
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
            background: url("../../assets/btn-bg2.png") no-repeat;
            background-size: 110% 300%;
            background-position: 50% 110%;
            background-color: #536471;
            box-shadow: 0px 2px 3px 0px #536471;
            transition: all .4s ;

            img {
                width: 72px;
                height: 16px;
            }
        }
    }
}
</style>