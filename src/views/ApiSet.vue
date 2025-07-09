<template>
  <div>
    <el-dialog class="common-dialog" modal-class="common-modal" v-model="visible" :show-close="false" width="600" :before-close="beforeClose">
      <div class="warning">
        <!-- <el-icon><Warning /></el-icon> -->
        <Warning style="width: 1em; height: 1em; margin-right: 8px" />
        开始对话后暂不支持切换模型
      </div>
      <div class="form-out">
        <el-form :model="form" ref="formRef" label-position="left" label-width="120" style="max-width: 600px">
          <el-form-item label="modelFrom" v-if="type != 1" >
            <el-radio-group v-model="form.modelFrom" :disabled="editable">
              <el-radio value="1">本地</el-radio>
              <el-radio value="2">开源</el-radio>
            </el-radio-group>
            <!-- <el-switch v-model="form.moreSet" /> -->
          </el-form-item>

          <el-form-item label="modelSelect" v-if="type != 1 && form.modelFrom == '1'" >
            <el-select v-model="form.modelSelect" placeholder="Select Model" style="width: 240px" @change="changeModel" :disabled="editable">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>

          <el-form-item label="api" v-if="form.modelFrom != '1'">
            <el-input v-model="form.api" maxlength="255" show-word-limit placeholder="请输入api" :disabled="editable"/>
          </el-form-item>

          <el-form-item label="modelSelect" v-if="type != 1 && form.modelFrom == '2'">
            <el-input v-model="form.modelSelect" maxlength="255" show-word-limit placeholder="模型选择" :disabled="editable" />
          </el-form-item>

          <el-form-item label="tokenKey" v-if="form.modelFrom != '1'">
            <el-input v-model="form.tokenKey" maxlength="255" show-word-limit placeholder="token名称" :disabled="editable" />
          </el-form-item>
          <el-form-item label="tokenValue" v-if="form.modelFrom != '1'">
            <el-input v-model="form.tokenValue" maxlength="255" show-word-limit placeholder="token值" :disabled="editable" />
          </el-form-item>
          <el-form-item label="systemSetup" v-if="form.modelFrom != '1' && type != 1">
            <el-input v-model="form.systemSetup" maxlength="255" show-word-limit placeholder="系统设定" :disabled="editable" />
          </el-form-item>

          <el-form-item label="更多配置">
            <el-switch v-model="form.moreSet" />
          </el-form-item>

          <!-- <el-form-item label="modelName" v-if="type != 1">
            <el-input v-model="form.modelName" maxlength="255" show-word-limit placeholder="模型名称" />
          </el-form-item> -->

          <!-- <el-form-item label="top-k">
            <el-slider v-model="form.topK" :marks="marks1" :step="5" :format-tooltip="formatTooltip" />
          </el-form-item> -->
          <!-- <el-form-item label="深度思考" style="margin-bottom: 0">
            <template #label>
              <div class="label-all">
                <div class="label-title">深度思考</div>
              </div>
            </template>
            <el-switch v-model="form.think" />
          </el-form-item>
          <div class="label-text">是否开启深度思考，若模型不支持，会省略此参数</div> -->
          <el-form-item label="maxTokens" label-width="120" style="margin-bottom: 0" v-if="form.moreSet">
            <template #label>
              <div class="label-all">
                <div class="label-title">max_tokens</div>
              </div>
            </template>
            <el-slider v-model="form.maxTokens" :step="1" :min="1" :max="getMaxTokens()" :format-tooltip="formatTooltip" style="width: calc(100%)" show-input />
            <!-- <div class="number">{{ form.maxTokens }}</div> -->
          </el-form-item>
          <div class="label-text" v-if="form.moreSet">限制一次请求中模型生成 completion 的最大 token 数</div>
          <el-form-item label="temperature" label-width="120" style="margin-bottom: 0" v-if="form.moreSet">
            <template #label>
              <div class="label-all">
                <div class="label-title">temperature</div>
              </div>
            </template>
            <el-slider v-model="form.temperature" :step="5" :format-tooltip="formatTooltip3" style="width: calc(100% - 180px)" />
            <div class="number">{{ form.temperature / 50 }}</div>
          </el-form-item>
          <div class="label-text" v-if="form.moreSet">(0-2) 值越大，回复越随机</div>
          <el-form-item label="top-p" label-width="120" style="margin-bottom: 0" v-if="form.moreSet">
            <template #label>
              <div class="label-all">
                <div class="label-title">top-p</div>
              </div>
            </template>
            <el-slider v-model="form.topP" :step="10" :format-tooltip="formatTooltip2" style="width: calc(100% - 180px)" />
            <div class="number">{{ form.topP / 100 }}</div>
          </el-form-item>
          <div class="label-text" v-if="form.moreSet">(0-1) 与temperature类似，但不要和temperature一起更改</div>
          <!-- <el-form-item >
            <el-button @click="addNewParam"></el-button>
          </el-form-item> -->
          <el-divider></el-divider>
          <el-form-item label="" label-width="0">
            <div style="position: relative; width: 100%; height: 100%">
              <el-button type="success" @click="addNewParam" class="inputs-btn">
                <el-icon>
                  <CirclePlusFilled />
                </el-icon>
              </el-button>
              <div class="infer-tag">&nbsp;点击右侧按钮添加自定义参数</div>
              <div>
                <div v-for="(input, index) in form.args" :key="index" class="input-wrapper">
                  <el-input v-model="input.key" placeholder="key" style="width: 120px"></el-input>
                  <el-input v-model="input.value" placeholder="value" style="width: calc(100% - 150px)"></el-input>
                  <el-button plain type="danger" :icon="CircleCloseFilled" @click="removeParam(index)" />
                </div>
              </div>
            </div>
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
import { CirclePlusFilled, CircleCloseFilled, Plus, Edit, ArrowDown, CloseBold, Warning } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { storeToRefs } from "pinia";
import { useJiuyuan } from "@/store";
import type { CSSProperties } from "vue";
import { cloneDeep } from "lodash";
const APIURL = import.meta.env.VITE_API_URL;
import axios from "axios";

const options = ref([]);

const args = ref([]);
const addNewParam = function () {
  form.value.args.push({ key: "", value: "" });
};
const removeParam = (index) => {
  form.value.args.splice(index, 1);
};

const getMaxTokens = function () {
  // 1280000
  if (form.value.modelFrom == "1" && form.value.modelSelect) {
    const foundModel = modelConfig.value.find((m) => m.id === form.value.modelSelect);
    // form.value.maxTokens = JSON.parse(JSON.stringify(foundModel.maxTokens));
    console.log(foundModel);
    return JSON.parse(JSON.stringify(foundModel.maxTokens));
  } else {
    return 1280000;
  }
};

const getModelList = async function () {
  console.log(APIURL);
  try {
    let res = await axios.get(`${APIURL}/models`);
    console.log(res);
    if (res && res.data && res.data.data) {
      options.value = [];
      res.data.data.forEach((item) => {
        let obj = { value: item.id, label: item.id };
        options.value.push(obj);
      });
      getModelConfig();
    }
    console.log("");
  } catch (error) {
    console.error("Error:", error);
  }
};

// 从配置文件获取模型配置，与从pinia获取的进行对比，优先使用pinia
const modelConfig = ref();
const basicConfig = ref();
const getModelConfig = async function () {
  try {
    let res = await axios.get(`./config.json?t=${Date.now()}`);
    console.log(res);
    if (res && res.data) {
      basicConfig.value = cloneDeep(res.data);
      modelConfig.value = cloneDeep(res.data.modelConfig);
      // 初始化
      // initConfig(res.data);
    }
    console.log("successfully");
  } catch (error) {
    console.error("Error:", error);
  }
};

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
  return val;
};
const formatTooltip2 = (val: number) => {
  return val / 100;
};
const formatTooltip3 = (val: number) => {
  return val / 50;
};

let emit = defineEmits(["close-card"]);

const jiuyuan = useJiuyuan();
const { topicList, jiugeApiBaseUrl, jiugeAuthHeader, apiBaseUrl, modelName, modelSelect, authHeader, systemSetup, llmParam } = storeToRefs(jiuyuan);

// console.log(jiugeApiBaseUrl.value);

const visible = ref(false);
const formRef = ref();

const initFormItem = ref({
  api: "",
  modelFrom: "1",
  modelName: "",
  modelSelect: "",
  tokenKey: "",
  tokenValue: "",
  systemSetup: "",
  topK: 0,
  topP: 0,
  temperature: 0,
  maxTokens: 4096,
  think: false,
  moreSet: false,
  args: [],
});

const form = ref({
  api: "",
  modelFrom: "1",
  modelName: "",
  modelSelect: "",
  tokenKey: "",
  tokenValue: "",
  systemSetup: "",
  topK: 0,
  topP: 0,
  temperature: 0,
  maxTokens: 4096,
  think: false,
  moreSet: false,
  args: [],
});

const props = defineProps(["type", "isOpen", "topicID"]);

const closeCard = function () {
  // console.log("close");
  emit("close-card");
  visible.value = false;
};

const beforeClose = function () {
  emit("close-card");
  visible.value = false;
};

const initConfig = function (data) {
  form.value.api = data.basicUrl;
  form.value.modelFrom = "1";
  form.value.modelSelect = data.basicModel;

  changeModel(form.value.modelSelect);
};

const editable = ref(false);
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
    let topicItem = topicList.value.find((item: any) => item.topic_id == props.topicID);
    console.log(topicItem);
    form.value.api = JSON.parse(JSON.stringify(topicItem.apiBaseUrl));
    form.value.systemSetup = JSON.parse(JSON.stringify(topicItem.systemSetup));
    form.value.modelFrom = JSON.parse(JSON.stringify(topicItem.modelFrom));
    form.value.modelName = JSON.parse(JSON.stringify(topicItem.modelName));
    form.value.modelSelect = JSON.parse(JSON.stringify(topicItem.modelSelect));
    form.value.tokenKey = JSON.parse(JSON.stringify(topicItem.authHeader.name));
    form.value.tokenValue = JSON.parse(JSON.stringify(topicItem.authHeader.value));
    // form.value.maxTokens = JSON.parse(JSON.stringify(topicItem.maxTokens));

    if (topicItem.apiBaseUrl == "" || topicItem.apiBaseUrl.length == 0) {
      form.value.api = basicConfig.value.basicUrl;
    }
    if (topicItem.modelSelect == "" || topicItem.modelSelect.length == 0) {
      form.value.modelSelect = basicConfig.value.basicModel;
    }

    if (Object.prototype.hasOwnProperty.call(topicItem, "moreSet")) {
      form.value.moreSet = JSON.parse(JSON.stringify(topicItem.moreSet));
    } else {
      form.value.moreSet = false;
    }

    const foundModel = modelConfig.value.find((m) => m.id === topicItem.modelSelect);
    console.log(modelConfig.value);
    console.log(foundModel);
    if (topicItem.think) {
      form.value.think = JSON.parse(JSON.stringify(topicItem.think));
    } else if (foundModel) {
      if (foundModel.think) {
        form.value.think = JSON.parse(JSON.stringify(foundModel.think));
      } else {
        form.value.think = false;
      }
    } else {
      form.value.think = false;
    }

    if (topicItem.topP) {
      form.value.topP = JSON.parse(JSON.stringify(topicItem.topP));
    } else if (foundModel) {
      form.value.topP = JSON.parse(JSON.stringify(foundModel.topP));
    } else {
      form.value.topP = 0;
    }

    if (topicItem.temperature) {
      form.value.temperature = JSON.parse(JSON.stringify(topicItem.temperature));
    } else if (foundModel) {
      form.value.temperature = JSON.parse(JSON.stringify(foundModel.temperature));
    } else {
      form.value.temperature = 0;
    }

    if (topicItem.maxTokens) {
      form.value.maxTokens = JSON.parse(JSON.stringify(topicItem.maxTokens));
    } else if (foundModel) {
      form.value.maxTokens = JSON.parse(JSON.stringify(foundModel.maxTokens));
    } else {
      form.value.maxTokens = 0;
    }

    if (topicItem.conv && topicItem.conv.length > 1) {
      editable.value = true;
    } else {
      editable.value = false;
    }

    if (topicItem.args && topicItem.args.length > 0) {
      form.value.args = JSON.parse(JSON.stringify(topicItem.args));
    } else {
      form.value.args = [];
    }
  }
};

const changeModel = function (val: any) {
  console.log(val);
  let topicItem = topicList.value.find((item: any) => item.topic_id == props.topicID);
  const foundModel = modelConfig.value.find((m) => m.id === val);
  console.log(foundModel);

  if (topicItem.maxTokens) {
    form.value.maxTokens = JSON.parse(JSON.stringify(topicItem.maxTokens));
  } else if (foundModel) {
    form.value.maxTokens = JSON.parse(JSON.stringify(foundModel.maxTokens));
  } else {
    form.value.maxTokens = 0;
  }

  if (topicItem.think) {
    form.value.think = JSON.parse(JSON.stringify(topicItem.think));
  } else if (foundModel) {
    if (foundModel.think) {
      form.value.think = JSON.parse(JSON.stringify(foundModel.think));
    } else {
      form.value.think = false;
    }
  } else {
    form.value.think = false;
  }

  if (topicItem.topP) {
    form.value.topP = JSON.parse(JSON.stringify(topicItem.topP));
  } else if (foundModel) {
    form.value.topP = JSON.parse(JSON.stringify(foundModel.topP));
  } else {
    form.value.topP = 0;
  }

  if (topicItem.temperature) {
    form.value.temperature = JSON.parse(JSON.stringify(topicItem.temperature));
  } else if (foundModel) {
    form.value.temperature = JSON.parse(JSON.stringify(foundModel.temperature));
  } else {
    form.value.temperature = 0;
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
        let data = cloneDeep(topicList.value);
        let topicItem = data.find((item: any) => item.topic_id == props.topicID);

        topicItem.apiBaseUrl = form.value.api;
        topicItem.modelFrom = form.value.modelFrom;
        topicItem.modelName = form.value.modelName;
        topicItem.modelSelect = form.value.modelSelect;
        topicItem.authHeader = { name: form.value.tokenKey, value: form.value.tokenValue };
        topicItem.systemSetup = form.value.systemSetup;

        topicItem.moreSet = form.value.moreSet;
        topicItem.think = form.value.think;
        topicItem.temperature = form.value.temperature;
        topicItem.maxTokens = form.value.maxTokens;
        topicItem.topP = form.value.topP;

        topicItem.args = form.value.args;

        jiuyuan.setTopicList(data);
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

onMounted(async () => {
  getModelList();
});

watch([() => props.isOpen], () => {
  console.log(props.isOpen);
  visible.value = props.isOpen;
  if (props.isOpen) {
    initForm();
    getModelList();
  }
});
</script>

<style scoped>
.warning {
  color: #ff8f0b;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.label-all {
  text-align: left;
}

.label-title {
}

.label-text {
  color: #bababa;
  font-size: 12px;
  height: 18px;
  line-height: 18px;
  margin-bottom: 10px;
}

.number {
  width: 100px;
  text-align: center;
}

.infer-tag {
  margin-bottom: 8px;
  background: #ebebeb;
  padding-left: 5px;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
}

.inputs-btn {
  position: absolute;
  right: 0;
  top: 0;
}

.input-wrapper {
  display: flex;
  margin-bottom: 8px;
}
</style>

<style>
.el-input__wrapper {
  padding: 0 8px;
}

.el-form-item {
  margin-bottom: 10px;
}

.el-dialog {
  padding: 20px 30px;
}

.el-input-number {
  /* width: 120px; */
}

.el-divider--horizontal {
  margin: 10px 0;
}

.common-dialog {
  box-shadow: 0px 6px 22px 1px rgba(0, 0, 0, 0.22);
  border-radius: 21px 21px 21px 21px;
}

</style>
