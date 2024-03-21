import { createApp } from 'vue'
import Activity from './Activity.vue'
import pinia from './stores'
import '../styles'
import "element-plus/theme-chalk/src/message.scss"
import "element-plus/theme-chalk/src/loading.scss"

import vuetify from '../plugins/vuetify'
import { loadFonts } from '../plugins/webfontloader'

import echarts from '../plugins/echarts'

loadFonts()

const app = createApp(Activity)
app.config.globalProperties.$echarts = echarts;
app.use(vuetify)
app.use(pinia)
app.mount('#app')   
