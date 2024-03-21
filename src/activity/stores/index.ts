import { createPinia, defineStore } from "pinia";
import { queryActivity } from '../../api/activitys'
import type { Activity, Gaming } from '../types'
import moment from 'moment'
import { fa } from "element-plus/es/locale";
const pinia = createPinia();


const useActivityStore = defineStore("activity", {
    state: () => {
        return {
            activityInfo: <Activity | null>null,
            // activityTimeStatus 
            // 0 Not started
            // 1 In progress
            // 2 Ended
            activityTimeStatus: <0 | 1 | 2>0,
            isLoading: <boolean>false,
            qaList: <Gaming[]>[]
        };
    },
    actions: {
        async queryActivityInfo(id) {
            try {

                let { data } = await queryActivity({ id })

                this.activityInfo = data

                this.checkActivityTime()

                if (this.activityInfo?.gaming) this.formatQaList()

                return data.isParticipate


            } catch (err) {

                console.log('err', err)

            }

        },
        async refreshActivityInfo() {
            try {

                let { data } = await queryActivity({ id: this.activityInfo.activity.id })

                this.activityInfo = data

                if (this.activityInfo?.gaming) this.formatQaList()

            } catch (err) {

                console.log('err', err)

            }
        },
        checkActivityTime() {

            const { activity: { startTime, endTime } } = this.activityInfo

            console.log('startTime, endTime,nowTime', startTime, endTime, moment.utc().format())

            const nowTimeStamp = moment.utc().valueOf()

            const startTimeStamp = moment(startTime).valueOf()

            const endTimeStamp = moment(endTime).valueOf()

            if (startTimeStamp > nowTimeStamp) {
                this.activityTimeStatus = 0
            } else if (endTimeStamp < nowTimeStamp) {
                this.activityTimeStatus = 2
            } else {
                this.activityTimeStatus = 1
            }

            console.log('nowTimeStamp,startTimeStamp,endTimeStamp', nowTimeStamp, startTimeStamp, endTimeStamp)
        },
        formatQaList() {

            let array = []

            this.activityInfo.gaming.forEach(v => {

                array.push({
                    ...v,
                    answerStatus: this.activityInfo?.userRecord?.userGame[v.id] ? this.activityInfo?.userRecord?.userGame[v.id] : 0
                })

            })
            console.log('qaList', array)
            
            this.qaList = array

        }
    },

    getters: {

        stepBgStatus: (state): boolean => {

            if (!state?.activityInfo || !state?.activityInfo?.userRecord) return false

            const { userRecord } = state.activityInfo

            if ((userRecord.rewardStatus === 4 && userRecord.isGetReward) || userRecord.rewardStatus === 5 || userRecord.rewardStatus === 1) {
                return true
            } else {
                return false
            }

        }

    }
});






export { useActivityStore }

export default pinia;

