import { defineStore } from 'pinia'

export const useJiuyuan = defineStore('jiuyuan', {
  // 相当于data
  state: () => {
    return {
      jiugeApiBaseUrl: sessionStorage.getItem('jiugeApiBaseUrl') || import.meta.env.VITE_JIUGE_API_BASE_URL,
      jiugeAuthHeader: JSON.parse(sessionStorage.getItem('jiugeAuthHeader') || '{"name": "Authorization", "value": ""}'),
      jiugeSetting: JSON.parse(sessionStorage.getItem('jiugeSetting') || '{"topk": "40", "topp": "80", "temperature": "40"}'),

      apiBaseUrl: sessionStorage.getItem('apiBaseUrl'),
      modelName: sessionStorage.getItem('modelName'),
      modelSelect: sessionStorage.getItem('modelSelect'),
      authHeader: JSON.parse(sessionStorage.getItem('authHeader') || '{"name": "Authorization", "value": ""}'),
      systemSetup: JSON.parse(sessionStorage.getItem('systemSetup')) 
        || "",

      llmParam: JSON.parse(sessionStorage.getItem('llmParam')) || {
        topK: 40, // 0-200
        topP: 80, // 0-1
        temperature: 40, // 0-2
      },
      topicList: JSON.parse(sessionStorage.getItem('topicList'))|| [], // 存储每个对话使用的模型配置，以及对话历史
    }
  },
  // 相当于计算属性
  getters: {
    
  },
  // 相当于vuex的 mutation + action，可以同时写同步和异步的代码
  actions: {
    setJiugeApiBaseUrl(url: string) {
      this.jiugeApiBaseUrl = url
      sessionStorage.setItem('jiugeApiBaseUrl', url)
    },
    setJiugeAuthHeader(name: string, value: string) {
      this.jiugeAuthHeader = { name, value }
      sessionStorage.setItem('jiugeAuthHeader', JSON.stringify(this.jiugeAuthHeader))
    },
    setJiugeSetting(topk: any, topp: any, temperature: string ) {
      this.jiugeSetting = { topk, topp, temperature }
      sessionStorage.setItem('jiugeSetting', JSON.stringify(this.jiugeSetting))
    },
    clearJiugeAuthHeader() {
      this.jiugeAuthHeader = { name: 'Authorization', value: '' }
      sessionStorage.removeItem('jiugeAuthHeader')
    },

    setApiBaseUrl(url: string) {
      this.apiBaseUrl = url
      sessionStorage.setItem('apiBaseUrl', url)
    },
    setModelName(name: string) {
      this.modelName = name
      sessionStorage.setItem('modelName', name)
    },
    setModelSelect(name: string) {
      this.modelSelect = name
      sessionStorage.setItem('modelSelect', name)
    },
    setAuthHeader(name: string, value: string) {
      this.authHeader = { name, value }
      sessionStorage.setItem('authHeader', JSON.stringify(this.authHeader))
    },
    clearAuthHeader() {
      this.authHeader = { name: 'Authorization', value: '' }
      sessionStorage.removeItem('authHeader')
    },
    setSystemSetup(value: string) {
      this.systemSetup = value
      sessionStorage.setItem('systemSetup', JSON.stringify(this.systemSetup))
    },

    setLlmParams(param: any) {
      this.llmParam = JSON.parse(JSON.stringify(param));
      sessionStorage.setItem('llmParam', JSON.stringify(param));
      console.log(this.llmParam)
    },
    clearLlmParams(){
      sessionStorage.removeItem('llmParam');
    },
    setTopicList(list: string) {
      this.topicList = list;
      sessionStorage.setItem('topicList', JSON.stringify(list));
    },
  },
})