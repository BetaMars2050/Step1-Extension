import { createApp } from 'vue'
import Airdrop from './Airdrop.vue'
import '../styles'
import "element-plus/theme-chalk/src/message.scss"
import "element-plus/theme-chalk/src/loading.scss"

import vuetify from '../plugins/vuetify'

const app = createApp(Airdrop)
app.use(vuetify)

app.mount('#app')   
