import { createApp } from 'vue'
import ConnectWallet from './ConnectWallet.vue'
import { loadFonts } from '../plugins/webfontloader'
import '../styles'
import "element-plus/theme-chalk/src/message.scss"
import "element-plus/theme-chalk/src/loading.scss"

loadFonts()
const app = createApp(ConnectWallet)

app.mount('#app')   
