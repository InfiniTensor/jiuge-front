<template>
  <div>
    <el-container style="height: 100vh">
      <el-header style="display: flex; align-items: center">
        <!-- <el-button :class="{ 'picked': pickItem == 3 }" @click="pick(3)">多模型对话</el-button> -->
        <div class="custom-style" style="width: 100%; display: flex; justify-content: center;">
          <el-segmented v-model="value" :options="options" @change="changeModel" size="large" />
        </div>
        <!-- <el-button @click="showMessage">showMessage</el-button> -->
      </el-header>
      <el-main style="padding: 0; height: calc(100% - 60px)">
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

const value = ref(1);
const options = ref([
      { label: "九格大模型", value: 1 },
      { label: "通用大模型", value: 2 },
    ]);
const pickItem = ref(1);

const changeModel = function(val: any){
  pickItem.value = val;
}

const pick = function (num: any) {
  pickItem.value = num;
};

const showMessage = function () {
  ElMessage.success("修改成功！");
};
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

.picked {
  background: #3bdfe9;
}
</style>

<style>
.custom-style .el-segmented {
  --el-segmented-item-selected-color: var(--el-text-color-primary);
  --el-segmented-item-selected-bg-color: #3fcaff;
  --el-border-radius-base: 16px;
}

.el-segmented--large{
  height: 48px;
}
.custom-style .el-segmented__group{
  margin: 4px;
}
</style>
