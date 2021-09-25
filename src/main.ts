import { createApp } from 'vue'
import App from './App.vue'
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
