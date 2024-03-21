

<script setup lang="ts">
import { useActivityStore } from '../stores'
import { toRefs, computed } from 'vue'
import { saveUserQaRecord } from '../../api/activitys'
import { showMessage } from '../../utils/message'
const activityStore = useActivityStore()

const { activityInfo, qaList } = toRefs(activityStore)




const isComplete = computed(() => {
    return qaList.value?.every(item => item?.answerStatus)
})

const submit = () => {
    console.log(qaList, 'qaList.value')

    if (!isComplete.value) return

    let arr = []

    qaList.value.forEach(v => {
        arr.push({
            activityId: v.activityId,
            qaId: v.id,
            answer: v.answerStatus
        })
    })

    saveUserQaRecord(arr).then(res => {
        console.log(res)
        activityStore.refreshActivityInfo()
    }).catch(err => {
        showMessage({ message: err.msg, type: 'error' })
        console.log(err)
    })

}

</script>

<template>
    <div class="arena" v-if="activityInfo.gaming.length">
        <div class="question-list">
            <div class="question-item" v-for="(question, index) in qaList" :key="question.id" :index="index"
                :question="question">
                <div class="question-title">Question{{ index + 1 }}:{{ question.question }}</div>
                <ElRadioGroup v-model="question.answerStatus" class="answer">
                    <div class="answer-row">
                        <div> A:{{ question.answerOne }}</div>
                        <ElRadio :label="1"></ElRadio>
                    </div>
                    <div class="answer-row">
                        <div> B:{{ question.answerTwo }}</div>
                        <ElRadio :label="2"></ElRadio>
                    </div>
                    <div class="answer-row" style="margin-bottom:0px">
                        <div> C:{{ question.answerThree }}</div>
                        <ElRadio :label="3"></ElRadio>
                    </div>
                </ElRadioGroup>
            </div>
        </div>

        <div class="bottom">


            <template v-if="!activityInfo.userRecord.isGaming">
                <div v-if="!isComplete" class="btn-disable" @click="submit">
                    <img src="../../assets/complete-white.png" alt="">
                </div>
                <div class="btn" v-else @click="submit">
                    <img src="../../assets/complete-white.png" alt="">
                </div>
            </template>

            <div class="arena-complete" v-else>
                Arena Complete!
            </div>

        </div>

    </div>
</template>

<style lang="scss" scoped>
.arena {


    .question-list {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        padding-left: 20px;
        margin-top: 20px;
        margin-right: 6px;
        height: 220px;
        overflow: auto;

        .question-item:last-child {
            margin-bottom: 0px !important;
        }

        .question-item {
            width: 356px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            padding: 20px 10px;
            margin-bottom: 20px;

            .question-title {
                font-size: 15px;
                font-family: Oswald-Regular, Oswald;
                font-weight: 400;
                color: #FFFFFF;
                line-height: 20px;
                margin-bottom: 20px;
                word-break: break-all;
            }


            .answer {
                width: 100%;

                .answer-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    width: 100%;
                    margin-bottom: 10px;
                    font-size: 15px;
                    font-family: Oswald-Regular, Oswald;
                    font-weight: 400;
                    color: #FFFFFF;
                    line-height: 20px;

                    div {
                        width: 93%;
                        word-break: break-all;
                    }
                }
            }



        }
    }

    .bottom {

        position: absolute;
        bottom: 36px;
        left: 50%;
        transform: translate(-50%, 0);

        .arena-complete {
            font-size: 20px;
            font-weight: 700;
            color: #00FFBD;
            line-height: 27px;
            text-align: center;
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
            margin-top: 35px;
            cursor: pointer;
            background: url("../../assets/btn-bg.png") no-repeat;
            background-size: 110% 300%;
            background-position: 50% 110%;
            background-color: #1D9BF0;
            box-shadow: 0px 2px 3px 0px #0068B0;
            transition: all .4s;

            img {
                width: 72px;
                height: 16px;

            }
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
            cursor: pointer;
            background: url("../../assets/btn-bg2.png") no-repeat;
            background-size: 110% 300%;
            background-position: 50% 110%;
            background-color: #536471;
            box-shadow: 0px 2px 3px 0px #536471;
            transition: all .4s;

            img {
                width: 72px;
                height: 16px;
            }
        }
    }
}
</style>

<style>
.question-list::-webkit-scrollbar {
    width: 8px;
}

.question-list::-webkit-scrollbar-thumb {
    border-radius: 236px;
    background: #00FFBD;
}

.question-list::-webkit-scrollbar-track {
    border-radius: 236px;
    background: rgba(255, 255, 255, 0.6);
}



.el-radio {
    padding-top: 4px !important;
    height: auto !important;
}

.el-radio__input.is-checked .el-radio__inner::after {
    transform: translate(-50%, -50%) scale(1) rotate(45deg) !important;
}

.el-radio .el-radio__label {
    display: none !important;
}

.el-radio__input .el-radio__inner::after {
    border: 1px solid #fff;
    border-left: 0;
    border-top: 0;
    height: 8px !important;
    left: 7px !important;
    top: 6px !important;
    width: 5px !important;
    border-radius: 0px !important;
    background-color: transparent !important;
    transition: all .15s ease-in !important;
    transform: translate(-50%, -50%) scale(0) rotate(45deg);
}




.el-radio .el-radio__inner {
    width: 16px !important;
    height: 16px !important;
    border: 1px solid #00FFBD !important;
    background: transparent !important;

}

.answer-row .el-radio__input.is-checked .el-radio__inner {
    border: 1px solid #00FFBD !important;
    background: #00FFBD !important
}
</style>