

<script setup lang="ts" >
import * as XLSX from 'xlsx'
import { toRefs, ref } from 'vue'
const props = defineProps<{
    steps: number,
    whitelist: string[]
}>()

const emit = defineEmits<{
    (e: 'uploadWhitelistSuccess', addressArr: any): void
    (e: 'uploadWhitelistError'): void
}>()

const { steps, whitelist } = toRefs(props)


const uploadExcel = (file: any, fileList: any) => {
    let files = { 0: file.raw }
    const whitelist = []
    const fileReader = new FileReader()
    fileReader.onload = (e: any) => {
        try {
            const workbook = XLSX.read(e.target.result, {
                type: 'binary'
            })
            console.log('workbook', workbook)
            const wsname = workbook.SheetNames[0]
            console.log('wsname', wsname)
            const ws: any = XLSX.utils.sheet_to_json(workbook.Sheets[wsname])
            ws.map((item: any) => {
                console.log('item', item)
                Object.values(item).map((child: any, index: number) => {
                    whitelist.push(child)
                })

            })
            console.log('whitelist', whitelist)
            emit('uploadWhitelistSuccess', { addressArr: whitelist })
        } catch (err) {
            console.log(err)
            emit('uploadWhitelistError')

        }
    }
    fileReader.readAsBinaryString(files[0])
}


</script>
<template>
    <div class="w-456px mt-20px mx-auto flex justify-between items-start" >

        <ElUpload ref="upload" accept=".xls,.xlsx" action="" :on-change="uploadExcel" :show-file-list="false"
            :auto-upload="false">
            <div class="upload cursor-pointer" v-ripple v-if="!whitelist.length">
                <img src="../../assets/upload-file.png" alt="">
                Upload
            </div>
            <div class="upload cursor-pointer" v-ripple v-else>
                <img src="../../assets/upload-file-success.png" alt="">
                Uploaded Successfully
            </div>
        </ElUpload>

        <div class="flex flex-col justify-between items-start flex-1 h-161px ml-20px">
            <div class="text-14px text-#536471" v-if="!whitelist.length">Download the template and edit it according to the
                specified format.
            </div>
            <div class="text-14px text-#536471" v-else>The file must be written in a specified format. You can download the
                template below and edit yourself.
            </div>
            <a href="https://step1matrix.s3.ap-southeast-1.amazonaws.com/file/template.xlsx" download
                class="h-32px text-15px text-#0f1419 flex justify-start items-center transition-all hover:bg-#1D9BF0 hover:bg-opacity-20 pr-10px pl-15px  cursor-pointer "
                v-ripple style="border-radius:145px ;">
                <div class="text-20px mr-10px" i-icon-park-outline-download-one /> Download Template
            </a>

        </div>

    </div>
</template>


<style lang="scss" scoped>
.upload {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 190px;
    height: 161px;
    background: rgba(83, 100, 113, 0.1);
    border-radius: 4px 4px 4px 4px;
    font-size: 15px;
    font-weight: 400;
    color: #0F1419;

    img {
        width: 80px;
        height: 80px;
        margin-bottom: 10px;
    }
}
</style>