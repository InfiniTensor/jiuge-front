<template>
  <div>
    <el-dialog v-model="visible" :show-close="false" width="600" :before-close="beforeClose">
      <div class="form-out">
        <el-form :model="form" ref="formRef" label-width="auto" style="max-width: 600px">
          <el-form-item label="api">
            <el-input v-model="form.api" maxlength="255" show-word-limit placeholder="请输入api" />
          </el-form-item>
          <el-form-item label="modelName" v-if="type != 1">
            <el-input v-model="form.modelName" maxlength="255" show-word-limit placeholder="模型选择" />
          </el-form-item>
          <el-form-item label="modelSelect" v-if="type != 1">
            <el-input v-model="form.modelSelect" maxlength="255" show-word-limit placeholder="模型选择" />
          </el-form-item>
          <el-form-item label="tokenKey">
            <el-input v-model="form.tokenKey" maxlength="255" show-word-limit placeholder="token名称" />
          </el-form-item>
          <el-form-item label="tokenValue">
            <el-input v-model="form.tokenValue" maxlength="255" show-word-limit placeholder="token值" />
          </el-form-item>
          <el-form-item label="systemSetup" v-if="type != 1">
            <el-input v-model="form.systemSetup" maxlength="255" show-word-limit placeholder="系统设定" />
          </el-form-item>

          <el-form-item label="top-k" v-if="type == 1">
            <el-slider v-model="form.topK" :marks="marks1" :step="5" :format-tooltip="formatTooltip" />
            <!-- <el-input v-model="form.topK" maxlength="255" show-word-limit placeholder="top-k" /> -->
          </el-form-item>
          <el-form-item label="top-p" v-if="type == 1">
            <el-slider v-model="form.topP" :marks="marks2" :step="10" :format-tooltip="formatTooltip2" />
            <!-- <el-input v-model="form.topP" maxlength="255" show-word-limit placeholder="top-p" /> -->
          </el-form-item>
          <el-form-item label="temperature" v-if="type == 1">
            <el-slider v-model="form.temperature" :marks="marks3" :step="5" :format-tooltip="formatTooltip3" />
            <!-- <el-input v-model="form.temperature" maxlength="255" show-word-limit placeholder="temperature" /> -->
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeCard" style="padding: 4px 20px">取消</el-button>
          <el-button type="primary" @click="submit(formRef)" style="padding: 4px 20px"> 确认 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Plus, Edit, ArrowDown, CloseBold } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { storeToRefs } from "pinia";
import { useJiuyuan } from "@/store";
import type { CSSProperties } from "vue";

interface Mark {
  style: CSSProperties;
  label: string;
}
type Marks = Record<number, Mark | string>;
const marks1 = reactive<Marks>({
  40: {
    style: {
      color: "#1989FA",
    },
    label: "80(推荐)",
  },
});
const marks2 = reactive<Marks>({
  80: {
    style: {
      color: "#1989FA",
    },
    label: "0.8(推荐)",
  },
});
const marks3 = reactive<Marks>({
  40: {
    style: {
      color: "#1989FA",
    },
    label: "0.8(推荐)",
  },
});
const formatTooltip = (val: number) => {
  return val * 2;
};
const formatTooltip2 = (val: number) => {
  return val / 100;
};
const formatTooltip3 = (val: number) => {
  return val / 50;
};

let emit = defineEmits(["close-card"]);

const jiuyuan = useJiuyuan();
const { jiugeApiBaseUrl, jiugeAuthHeader, apiBaseUrl, modelName, modelSelect, authHeader, systemSetup, llmParam } = storeToRefs(jiuyuan);

console.log(jiugeApiBaseUrl.value);

const visible = ref(false);
const formRef = ref();

const initFormItem = ref({
  api: "",
  modelName: "",
  modelSelect: "",
  tokenKey: "",
  tokenValue: "",
  systemSetup: "",
  topK: 0,
  topP: 0,
  temperature: 0,
});

const form = ref({
  api: "",
  modelName: "",
  modelSelect: "",
  tokenKey: "",
  tokenValue: "",
  systemSetup: "",
  topK: 0,
  topP: 0,
  temperature: 0,
});

const props = defineProps(["type", "isOpen"]);

const closeCard = function () {
  // console.log("close");
  emit("close-card");
  visible.value = false;
};

const beforeClose = function () {
  emit("close-card");
  visible.value = false;
};

const initForm = function () {
  console.log("initForm");
  if (props.type == 1) {
    if (jiugeApiBaseUrl.value) {
      form.value.api = JSON.parse(JSON.stringify(jiugeApiBaseUrl.value));
      form.value.tokenKey = JSON.parse(JSON.stringify(jiugeAuthHeader.value.name));
      form.value.tokenValue = JSON.parse(JSON.stringify(jiugeAuthHeader.value.value));

      if (llmParam.value.topK) {
        form.value.topK = llmParam.value.topK;
        form.value.topP = llmParam.value.topP;
        form.value.temperature = llmParam.value.temperature;
      }
    }
  } else {
    console.log(authHeader.value);
    form.value.api = JSON.parse(JSON.stringify(apiBaseUrl.value));
    form.value.systemSetup = JSON.parse(JSON.stringify(systemSetup.value));
    form.value.modelName = JSON.parse(JSON.stringify(modelName.value));
    form.value.modelSelect = JSON.parse(JSON.stringify(modelSelect.value));
    form.value.tokenKey = JSON.parse(JSON.stringify(authHeader.value.name));
    form.value.tokenValue = JSON.parse(JSON.stringify(authHeader.value.value));
  }
};

const submit = (formEl: any) => {
  if (!formEl) return;
  formEl.validate(async (valid: any) => {
    if (valid) {
      if (props.type == 1) {
        jiuyuan.setJiugeApiBaseUrl(form.value.api);
        jiuyuan.setJiugeAuthHeader(form.value.tokenKey, form.value.tokenValue);
        jiuyuan.setJiugeApiBaseUrl(form.value.api);
        let data = {
          topK: form.value.topK,
          topP: form.value.topP,
          temperature: form.value.temperature,
        };
        jiuyuan.setLlmParams(data);
      } else {
        jiuyuan.setApiBaseUrl(form.value.api);
        jiuyuan.setAuthHeader(form.value.tokenKey, form.value.tokenValue);
        jiuyuan.setModelSelect(form.value.modelSelect);
        jiuyuan.setModelName(form.value.modelName);
        jiuyuan.setSystemSetup(form.value.systemSetup);
      }

      emit("close-card");
      visible.value = false;
      ElMessage.success("修改成功！");
    } else {
      console.log("error submit!");
      return false;
    }
  });
};

onMounted(async () => {});

watch([() => props.isOpen], () => {
  console.log(props.isOpen);
  visible.value = props.isOpen;
  if (props.isOpen) {
    initForm();
  }
});
</script>

<style scoped></style>

<style>
.el-input__wrapper {
  padding: 0 8px;
}
</style>
