<template>
  <div>
    <el-container style="height: 100vh;">
      <el-header style="display: flex; align-items: center;">
        <el-button :class="{ 'picked': pickItem == 1 }" @click="pick(1)">九格大模型</el-button>
        <el-button :class="{ 'picked': pickItem == 2 }" @click="pick(2)">通用大模型</el-button>
        <!-- <el-button :class="{ 'picked': pickItem == 3 }" @click="pick(3)">多模型对话</el-button> -->
        <!-- <el-button @click="showMessage">showMessage</el-button> -->
      </el-header>
      <el-main style="padding: 0; height: calc(100% - 60px);">
        <jiuge v-if="pickItem == 1"></jiuge>
        <llm v-if="pickItem == 2"></llm>
        <!-- <llm2 v-if="pickItem == 3"></llm2> -->
        <!-- <multillm v-if="pickItem == 3"></multillm> -->
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus";
// import HelloWorld from "./components/HelloWorld.vue";
const jiuge = defineAsyncComponent(() => import("@/views/jiuge.vue"));
const llm = defineAsyncComponent(() => import("@/views/llm.vue"));
// const multillm = defineAsyncComponent(() => import("@/views/multillm.vue"));

const pickItem = ref(1);
const pick = function(num: any){
  pickItem.value = num;
}

const showMessage = function(){
  ElMessage.success("修改成功！");
}

</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.picked{
  background: #3bdfe9;
}
</style>
