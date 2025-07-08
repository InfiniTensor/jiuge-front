<template>
  <el-container style="height: 100vh">
    <el-main style="padding: 0; height: calc(100%)">
      <llm></llm>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus";
const llm = defineAsyncComponent(() => import("@/views/llm.vue"));

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
