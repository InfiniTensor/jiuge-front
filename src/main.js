import { createApp } from 'vue'
import './style.css'
import './assets/styles/llm.scss'
import App from './App.vue'
const app = createApp(App)

import { createPinia } from 'pinia'
const pinia = createPinia()
app.use(pinia)

import 'element-plus/dist/index.css'

import '@/assets/font/font_login/iconfont.css'
import '@/assets/font/font_login/iconfont.js'

import * as echarts from 'echarts'
import ECharts from 'vue-echarts';

// 复制到粘贴板
import VueClipboard from 'vue-clipboard2'
app.use(VueClipboard)

app.component('VChart', ECharts);
app.config.globalProperties.$echarts = echarts

app.mount('#app')
