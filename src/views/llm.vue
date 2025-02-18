<template>
  <div class="aichat-main">
    <div class="chat-class">
      <div class="feed-out">
        <ApiSet ref="apiSetRef" :type="2" :isOpen="isOpen" @close-card="handleCloseCard"></ApiSet>
      </div>

      <div class="use-method">
          <div id="side_menu" :class="['side_menu', { collapsible: isCollapsible }]">
            <div style="">
              <div
                v-for="(item, i) in menuItems"
                :key="item.text"
                class="menu_item"
                :class="{ 'big-menu_item': item.bigicon }"
                @mouseenter="showPopover(item)"
                @mouseleave="hidePopover"
                @click="toggleEvent(i)"
              >
                <el-image :src="item.icon" class="side-img" :class="{ 'big-side-img': item.bigicon, 'small-side-img': item.smallicon }"></el-image>
                <span class="menu_text">{{ item.text }}</span>
                <div v-show="item.showPopover" class="popover">{{ item.text }}</div>
              </div>
            </div>
            <div class="menu_item toggle" @click="toggleMenu">
              <el-icon><ArrowRightBold class="side-menu-icon" /></el-icon>
            </div>
          </div>
        </div>

      <!-- <div class="model-pick">
        <div :class="['dropdown-container', { expanded: isExpanded }]" :style="boxStyle" ref="confPlace">
          <div class="dd-header" @click="openForm">
            <div>{{ modelName }}</div>
          </div>
        </div>
      </div> -->
      <el-scrollbar ref="scrollArea" class="scroll-area" style="width: 100%; height: calc(100% - 150px); margin-top: 10px">
        <el-watermark :content="['AI生成', '生成内容仅供参考']" :gap="config.gap" :z-index="config.zIndex" :font="config.font">
          <div class="all-content" ref="allOutDiv" v-if="conversation.length > 0">
            <template v-for="(conv, i) in conversation" :key="i">
              <!-- human -->
              <div v-if="conv.speaker == 'user'" class="human">
                <div class="h-content">
                  <div class="h-inner">
                    <div class="h-c1" v-if="!conv.isEdit">
                      <div class="c2">
                        {{ conv.content }}
                      </div>
                      <div class="h-c3-out">
                        <div class="h-c3">
                          <div class="own-pagnation">
                            <div v-if="conv.nodeInfo && conv.nodeInfo.length != 1" style="display: flex; align-items: center;">
                              <el-button link @click="switchBranch(conv.idx, -1)" :disabled="conv.nodeInfo.pPage == 1">
                                <svg class="icon6" aria-hidden="true" v-if="conv.nodeInfo.pPage != 1">
                                  <use xlink:href="#icon-xiangzuo1"></use>
                                </svg>
                                <svg class="icon6" aria-hidden="true" v-else>
                                  <use xlink:href="#icon-xiangzuo"></use>
                                </svg>
                              </el-button>
                              <span class="page-inner">
                                {{ conv.nodeInfo.pPage }}
                              </span>
                              <span class="page-inner grey-color"> / </span>
                              <span class="page-inner grey-color"> {{ conv.nodeInfo.length }}</span>
                              <el-button link @click="switchBranch(conv.idx, 1)" :disabled="conv.nodeInfo.pPage == conv.nodeInfo.length">
                                <svg class="icon6" aria-hidden="true" v-if="conv.nodeInfo.pPage != conv.nodeInfo.length">
                                  <use xlink:href="#icon-xiangyou1"></use>
                                </svg>
                                <svg class="icon6" aria-hidden="true" v-else>
                                  <use xlink:href="#icon-xiangyou"></use>
                                </svg>
                              </el-button>
                            </div>
                          </div>
                          <div class="edit-btn-out" v-if="!getLoading">
                            <el-tooltip class="box-item" effect="dark" content="编辑" placement="bottom">
                              <el-button link @click="reEdit(conv, i)" circle>
                                <svg class="icon1" aria-hidden="true">
                                  <use xlink:href="#icon-bianji1"></use>
                                </svg>
                              </el-button>
                            </el-tooltip>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="h-c1-all" v-else>
                      <div class="c2" ref="editRefOut">
                        <el-input ref="editRef" v-model="editText" autosize type="textarea" class="edit-text" :class="textareaClass" />
                      </div>
                      <div class="h-c3-out">
                        <div class="h-c3-edit">
                          <el-button link class="btn-tooltip" @click="confirmReEdit(conv, i)" v-if="editText.length != 0">
                            <svg class="icon4" aria-hidden="true">
                              <use xlink:href="#icon-duihao2"></use>
                            </svg>
                          </el-button>
                          <el-button link class="btn-tooltip" @click="cancelReEdit(conv, i)" style="margin-left: 0px">
                            <svg class="icon5" aria-hidden="true">
                              <use xlink:href="#icon-ruocuowu"></use>
                            </svg>
                          </el-button>
                        </div>
                      </div>
                    </div>
                    <div class="user">
                      <el-image :src="myAvatar" class="hm-img"></el-image>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ai -->
              <div v-if="conv.speaker == 'assistant' || conv.speaker == 'default'" class="ai">
                <div class="ai-content" :class="{ 'last-item-ai': i == conversation.length - 1 }">
                  <div class="ai-inner">
                    <div class="user">
                      <el-image :src="aiAvatar" class="ai-img"></el-image>
                    </div>
                    <div class="ai-c1">
                      <!-- v-html="markdownToHtml" -->
                      <div class="ai-c2" :class="{ 'warn-outer': conv.content == server_error }">
                        <div v-if="conv.speaker == 'default'" class="ai-title">
                          {{ conv.title }}
                        </div>
                        <div class="warn-icon" v-if="conv.content == server_error">
                          <svg class="icon2" aria-hidden="true">
                            <use xlink:href="#icon-jinggao3"></use>
                          </svg>
                        </div>
                        <!-- v-html="mdToHtml(conv.content, conv)" -->
                        <div :class="{ 'result-streaming': getLoading && conversation.length-1 == i, 'warn-content': conv.content == server_error }" class="c2" 
                          v-html="conv.htmlContent"
                        ></div>
                        <!-- <div>{{ x }}</div> -->
                        <div v-if="conv.isStart" class="start-prompt">
                          <div v-for="(item, j) in initPrompt" :key="j" class="prompt-style">
                            <el-icon class="right-icon">
                              <CaretRight />
                            </el-icon>
                            <div>{{ item.content }}</div>
                          </div>
                        </div>
                      </div>
                      <div class="ai-c3-out">
                        <div class="ai-c3" v-if="!conv.loading && !conv.title">
                          <div class="ai-c3-btn">
                            <!-- <el-divider direction="vertical" /> -->
                            <el-tooltip class="box-item" effect="dark" content="复制markdown" placement="bottom">
                              <el-button link @click="copyMD(conv)" class="btn-tooltip" circle>
                                <svg class="icon3" aria-hidden="true">
                                  <use xlink:href="#icon-fuzhi2"></use>
                                </svg>
                              </el-button>
                            </el-tooltip>
                            <el-divider direction="vertical" style="margin: 0 5px ;" v-if="i == conversation.length - 1 && conv.idx != 1" />
                            <el-tooltip class="box-item" effect="dark" content="重新生成" placement="bottom" v-if="i == conversation.length - 1 && conv.idx != 1">
                              <el-button link @click="rebuildChat(conv, i)" class="btn-tooltip" style="margin-right: 0px" circle>
                                <svg class="icon1" aria-hidden="true">
                                  <use xlink:href="#icon-zhongxinshuru"></use>
                                </svg>
                              </el-button>
                            </el-tooltip>
                          </div>

                          <div class="own-pagnation">
                            <div v-if="conv.nodeInfo && conv.nodeInfo.length != 1">
                              <el-button link @click="switchBranch(conv.idx, -1)" :disabled="conv.nodeInfo.pPage == 1">
                                <svg class="icon6" aria-hidden="true" v-if="conv.nodeInfo.pPage != 1">
                                  <use xlink:href="#icon-xiangzuo1"></use>
                                </svg>
                                <svg class="icon6" aria-hidden="true" v-else>
                                  <use xlink:href="#icon-xiangzuo"></use>
                                </svg>
                              </el-button>
                              <span class="page-inner">
                                {{ conv.nodeInfo.pPage }}
                              </span>
                              <span class="page-inner grey-color"> / </span>
                              <span class="page-inner grey-color"> {{ conv.nodeInfo.length }}</span>
                              <el-button link @click="switchBranch(conv.idx, 1)" :disabled="conv.nodeInfo.pPage == conv.nodeInfo.length">
                                <svg class="icon6" aria-hidden="true" v-if="conv.nodeInfo.pPage != conv.nodeInfo.length">
                                  <use xlink:href="#icon-xiangyou1"></use>
                                </svg>
                                <svg class="icon6" aria-hidden="true" v-else>
                                  <use xlink:href="#icon-xiangyou"></use>
                                </svg>
                              </el-button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <div class="empty"></div>
          </div>
        </el-watermark>
      </el-scrollbar>

      <div class="stable-position" v-if="!isAutoScrollEnabled && !getLoading" @click="scrollToBottomManual">
        <el-button link class="btn-tooltip">
          <svg class="icon5" aria-hidden="true">
            <use xlink:href="#icon-xiangxia31"></use>
          </svg>
        </el-button>
      </div>

      <!-- 输入区 -->
      <div class="bottom-item" id="inputArea">
        <div class="file-position">
          <!-- 文件 or 图像 -->
        </div>
        <div class="input-position">
          <div class="ipt" v-if="unSupportInput == 0">
            <textarea ref="inputChat" v-model="textarea" @keydown.enter="handleEnterKeyDown" @keyup.enter="handleEnterKeyUp" />
            <div ref="inputBtn" class="btn-outer">
              <div @click="getData(1)" class="click-btn" v-if="!getLoading && textarea.length > 0">
                <svg class="icon8" aria-hidden="true">
                  <use xlink:href="#icon-fasong"></use>
                </svg>
              </div>
              <!-- 如果输入框为空，是不允许发送数据的 -->
              <div @click="notAllowSend()" class="click-btn not-allow-send" v-if="!getLoading && textarea.length == 0">
                <svg class="icon8" aria-hidden="true">
                  <use xlink:href="#icon-fasong1"></use>
                </svg>
              </div>
              <div @click="stopConversion()" class="click-btn" v-if="getLoading">
                <svg
                  version="1.1"
                  id="L6"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  x="0px"
                  y="0px"
                  viewBox="0 0 100 100"
                  enable-background="new 0 0 100 100"
                  xml:space="preserve"
                >
                  <rect fill="none" stroke="#fff" stroke-width="4" x="25" y="25" width="50" height="50">
                    <animateTransform attributeName="transform" dur="0.5s" from="0 50 50" to="180 50 50" type="rotate" id="strokeBox" attributeType="XML" begin="rectBox.end" />
                  </rect>
                  <rect x="27" y="27" fill="#fff" width="46" height="50">
                    <animate attributeName="height" dur="1.3s" attributeType="XML" from="50" to="0" id="rectBox" fill="freeze" begin="0s;strokeBox.end" />
                  </rect>
                </svg>
              </div>
              <div></div>
            </div>
          </div>

          <div class="resend" v-if="unSupportInput == 1">
            <el-button class="resend-btn" @click="rebuildChat(conversation[conversation.length - 1], 0)">
              <span class="resend-text">重新生成</span>
              <svg class="icon3" aria-hidden="true">
                <use xlink:href="#icon-zhongxinshengcheng4"></use>
              </svg>
            </el-button>
          </div>

          <div class="resend" v-if="unSupportInput == 2">
            <el-button class="resend-btn" @click="reReEdit(conversation[conversation.length - 1], 0)">
              <span class="resend-text">重新发送</span>
              <svg class="icon3" aria-hidden="true">
                <use xlink:href="#icon-zhongxinshengcheng4"></use>
              </svg>
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="AiChatLocal">
import elementResizeDetectorMaker from "element-resize-detector";
import { ElMessage, ElMessageBox } from "element-plus";
import { v4 as uuidv4 } from "uuid";
import { ArrowRightBold, CaretBottom, CaretRight, DocumentCopy, CopyDocument, RefreshRight, Document, Picture, Edit, EditPen, Pouring, Sunny, CircleCheck, CircleClose } from "@element-plus/icons-vue";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { getAssetsFile } from "@/utils/tools.js";
const ApiSet = defineAsyncComponent(() => import("@/views/ApiSet.vue"));

import axios from "axios";
import type { CSSProperties } from "vue";
import { storeToRefs } from "pinia";
import { useJiuyuan } from "@/store";
import { get } from "http";

const isCollapsible = ref(true);
const menuItems = reactive([
  { icon: getAssetsFile("image/setting.png"), text: "设置", showPopover: false, bigicon: false, smallicon: false },
  { icon: getAssetsFile("image/clean.png"), text: "清空", showPopover: false, bigicon: false, smallicon: false },
  { icon: getAssetsFile("image/download.png"), text: "下载", showPopover: false, bigicon: false, smallicon: false },
  // { icon: "#icon-icon_shangchuanjilu", text: "上传记录", showPopover: false },
]);

const toggleEvent = async (index: Number) => {
  if (index == 0) {
    openForm();
  } else if (index == 1) {
    clearChat();
  } else if (index == 2) {
    downloadChat();
    // console.log(conversation.value)
    // console.log(tempConv.value)
  }
};

const showPopover = (item: any) => {
  item.showPopover = true;
};

const hidePopover = (item: any) => {
  item.showPopover = false;
};

const toggleMenu = async () => {
  isCollapsible.value = !isCollapsible.value;
};

const isOpen = ref(false);
const apiSetRef = ref();
const openForm = function () {
  isOpen.value = !isOpen.value;
};
const handleCloseCard = function () {
  isOpen.value = false;
};

const jiuyuan = useJiuyuan();
const { llmParam, apiBaseUrl, modelSelect, authHeader, systemSetup, modelName } = storeToRefs(jiuyuan);

watch(apiBaseUrl, (newVal) => {
  console.log("API Base URL changed:", newVal);
  // 在这里执行你需要的操作，例如更新页面显示
});

const updateLLmParams = function (data: any) {
  jiuyuan.setLlmParams(data);
};

const temp_dialogue_id = ref(0);

let emit = defineEmits(["update-data"]);

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
const initvalue1 = ref(40); // [0-200] / 2
const initvalue2 = ref(80); // [0-100] / 100
const initvalue3 = ref(40); // [0-200] / 100

const value1 = ref(40);
const value2 = ref(80);
const value3 = ref(40);

const initConf = function () {
  console.log(llmParam.value);
  if (llmParam.value.topK) {
    console.log(1);
    value1.value = llmParam.value.topK;
    value2.value = llmParam.value.topP;
    value3.value = llmParam.value.temperature;
    console.log(value1.value);
  } else {
    console.log(2);
    value1.value = JSON.parse(JSON.stringify(initvalue1.value));
    value2.value = JSON.parse(JSON.stringify(initvalue2.value));
    value3.value = JSON.parse(JSON.stringify(initvalue3.value));
    let data = {
      topK: value1.value,
      topP: value2.value,
      temperature: value3.value,
    };
    updateLLmParams(data);
  }
};

const backConf = function () {
  console.log(llmParam.value);

  value1.value = JSON.parse(JSON.stringify(initvalue1.value));
  value2.value = JSON.parse(JSON.stringify(initvalue2.value));
  value3.value = JSON.parse(JSON.stringify(initvalue3.value));
  let data = {
    topK: value1.value,
    topP: value2.value,
    temperature: value3.value,
  };
  updateLLmParams(data);
};

const isExpanded = ref(false);
const showNumber = function () {
  isExpanded.value = !isExpanded.value;
  if (isExpanded.value) {
    document.addEventListener("click", checkClickOutside);
  }
};
const confPlace = ref();
const checkClickOutside = async (event: any) => {
  if (confPlace.value && event.target && !confPlace.value.contains(event.target)) {
    console.log("cancelConf");
    cancelConf();
  }
};
const cancelConf = function () {
  isExpanded.value = false;
  document.removeEventListener("click", checkClickOutside);
};

const boxStyle = computed(() => {
  if (window.innerWidth <= 1440) {
    return {
      width: isExpanded.value ? "260px" : "130px",
      height: isExpanded.value ? "168px" : "32px",
      marginLeft: isExpanded.value ? "-65px" : "0px",
    };
  } else if (window.innerWidth > 1440 && window.innerWidth <= 1920) {
    return {
      width: isExpanded.value ? "320px" : "160px",
      height: isExpanded.value ? "168px" : "36px",
      marginLeft: isExpanded.value ? "-80px" : "0px",
    };
  } else {
    return {
      width: isExpanded.value ? "400px" : "200px",
      height: isExpanded.value ? "168px" : "42px",
      marginLeft: isExpanded.value ? "-100px" : "0px",
    };
  }
  // margin: isExpanded.value ? '0 auto' : '0 auto',
});

const sliderContainerStyle = computed(() => ({
  overflow: "hidden",
  height: isExpanded.value ? "auto" : "0",
}));
const formatTooltip = (val: number) => {
  return val * 2;
};
const formatTooltip2 = (val: number) => {
  return val / 100;
};
const formatTooltip3 = (val: number) => {
  return val / 50;
};

const handleCommand = (command: string | number | object) => {};

const config = reactive({
  font: {
    fontSize: 14,
    color: "rgba(0, 0, 0, 0.10)",
  },
  zIndex: 1,
  rotate: -22,
  gap: [150, 150] as [number, number],
  offset: [] as unknown as [number, number],
});

const refreshSignal = ref(false);
const triggerRefresh = () => {
  // 触发刷新
  refreshSignal.value = !refreshSignal.value; // 改变 refreshSignal 的值以触发响应
};

const myAvatar = getAssetsFile("image/user.png");
const aiAvatar = getAssetsFile("image/ai-logo.png");

const textarea = ref("");
const inputChat = ref();
const inputBtn = ref();

const initPrompt = ref([{ content: "需要设置通用模型的配置" }]);

const initConversation = ref([
  {
    speaker: "default",
    title: "Hi，我是AI助手",
    content: "对话基于通用模型的api，与网页本身无关。",
    loading: false,
    isStart: true,
    idx: 0,
    parentId: -1,
    children: [],
  },
]);
// You are ChatGLM3, a large language model trained by Zhipu.AI. Follow the user's instructions carefully. Respond using markdown.

const conversation = ref([
  {
    speaker: "default",
    title: "Hi，我是AI助手",
    content: "对话基于通用模型的api，与网页本身无关。",
    loading: false,
    isStart: true,
    idx: 0,
    parentId: -1,
    children: [],
  },
]);

const myUuid = ref("");
const initUUID = function () {
  generateUuid();
};

// 生成唯一标识
const generateUuid = () => {
  let name = ref(localStorage.getItem("name"));
  console.log(name);
  if (name.value) {
    myUuid.value = uuidv4() + "-" + name.value;
    // console.log(myUuid)
  } else {
    myUuid.value = uuidv4() + "-" + "customer";
  }
  sessionStorage.setItem("itemUuid", myUuid.value);
  // sessionStorage.removeItem('itemUuid');
};

const handleEnterKeyDown = (event: any) => {
  event.preventDefault(); // 阻止 Enter 键的默认换行行为
};

const handleEnterKeyUp = (event: any) => {
  event.preventDefault();
  getData(1); // 调用您的函数
};

const initParams = function () {
  isAutoScrollEnabled.value = true;
};
// 2024-03-18 ghn
const topicID = ref(0);
const topicItem = ref();
// 为了保存数据使用
const oldTopic = ref();

const test = function () {
  console.log(conversation.value);
};

const tempConv = ref([]);
// 滚动条是否平滑滚动，如果是切换分支，需要滑动，如果是api的信息，则不平滑（因为信息来源的数据发送问题）
const isSwitchable = ref(false);
const showDialogueList = async function () {
  // 每次进入后会把原来的记录留存，需要初始化
  // console.log(tempConv.value);
  tempConv.value = JSON.parse(localStorage.getItem("conv"));
  temp_dialogue_id.value = tempConv.value.length;
  console.log(tempConv.value);

  await updateConversationForLatestLeaf();
};

// 查找以当前列表内最新create_time的叶子节点
const findLatestLeafNode = function (conversation: any) {
  return conversation
    .filter((node: any) => node.children.length === 0)
    .reduce((latest: any, node: any) => (!latest || new Date(node.create_time) > new Date(latest.create_time) ? node : latest), null);
};

const getNodeInfo = (nodeId: any) => {
  // console.log(nodeId)
  const node = tempConv.value.find((node: any) => node.idx === nodeId);
  if (node) {
    // console.log(node)
    return {
      currentPage: node.currentPage,
      length: node.children.length,
      // 其他需要的信息
    };
  }
  return {
    currentPage: -1,
    length: 1,
    // 其他需要的信息
  }; // 如果没有找到节点，可以返回null或其他默认值
};

// 应用
const updateConversationForLatestLeaf = async function () {
  const subtreeNodes = await getSubtreeNodes(0, tempConv.value);
  console.log(subtreeNodes);
  const latestLeafNode = await subtreeNodes
    .filter((node: any) => node.children.length === 0)
    // .reduce((latest: any, node: any) => (!latest || new Date(node.create_time) > new Date(latest.create_time) ? node : latest), null);
    .reduce((latest: any, node: any) => {
      // 打印每次 reduce 中的最新节点和当前节点
      if (!latest || new Date(parseInt(node.create_time)) > new Date(parseInt(latest.create_time))) {
        console.log(`New latest node found:`, node);
        return node;
      }
      return latest;
    }, null);

  if (!latestLeafNode) {
    console.log("No leaf node found in the subtree.");
    return [];
  }
  // console.log(latestLeafNode);

  const pathToRoot = await getPathToRoot(latestLeafNode.idx, tempConv.value);

  // 根据pathToRoot来更新UI显示的实际对话
  console.log(pathToRoot);
  conversation.value = pathToRoot;
  // console.log("Path to root:", pathToRoot.map(node => node.id).join(" -> "));
};

// 负责获取指定根节点下的所有子树节点，包括根节点本身
const getSubtreeNodes = function (rootId: any, conv: any) {
  console.log(conv);
  let subtreeNodes = [];
  let stack = [rootId];

  while (stack.length > 0) {
    const nodeId = stack.pop();
    const node = conv.find((n: any) => n.idx === nodeId);
    // console.log(node);
    if (node) {
      subtreeNodes.push(node);
      // 检查是否存在子节点
      // if (node.children && node.children.length > 0) {
      stack.push(...node.children);
      // }
      // stack.push(...node.children);
    }
  }

  return subtreeNodes;
};

// 找到从指定叶子节点到根节点的路径
const getPathToRoot = function (leafNodeId: any, conversation: any) {
  let path = [];
  let currentNode = conversation.find((node: any) => node.idx === leafNodeId);
  // console.log(currentNode)
  while (currentNode) {
    path.unshift(currentNode); // 将当前节点添加到路径的开头
    // 检查当前节点是否有父节点
    // console.log(currentNode);
    if (currentNode.parentId !== -1) {
      const parentNode = JSON.parse(JSON.stringify(conversation.find((node: any) => node.idx === currentNode.parentId)));

      // 更新 parentNode 的 currentPage 为当前节点在父节点 children 中的位置 + 1
      const childIndex = parentNode.children.indexOf(currentNode.idx);
      if (childIndex !== -1) {
        parentNode.currentPage = childIndex + 1;
      }

      currentNode.nodeInfo = {
        pPage: parentNode.currentPage,
        length: parentNode.children.length,
      };

      currentNode = parentNode; // 继续向上遍历
    } else {
      break; // 如果当前节点是根节点，则结束循环
    }
  }

  return path;
};

// 切换分支的逻辑
const switchBranch = function (currentNodeId: any, direction: any) {
  console.log(conversation.value);
  console.log(tempConv.value);
  // 查找当前节点
  isSwitchable.value = true;

  const currentNode = tempConv.value.find((node: any) => node.idx === currentNodeId);
  if (!currentNode) {
    console.error("Current node not found.");
    return;
  }

  // 如果当前节点是根节点或没有找到父节点，则无法切换兄弟节点
  if (currentNode.parentId === -1) {
    console.log("Root node or parent node not found. Cannot switch branches.");
    return;
  }

  // 查找父节点
  const parentNode = tempConv.value.find((node: any) => node.idx === currentNode.parentId);
  if (!parentNode) {
    console.error("Parent node not found.");
    return;
  }

  // 在父节点的 children 中找到当前节点的位置
  const currentIndex = parentNode.children.indexOf(currentNodeId);
  if (currentIndex === -1) {
    console.error("Current node is not a child of its parent.");
    return;
  }

  // 计算新的索引位置
  let newIndex = currentIndex + direction;
  // 确保新索引在有效范围内
  if (newIndex < 0 || newIndex >= parentNode.children.length) {
    console.log("Cannot switch to sibling out of bounds.");
    return;
  }
  console.log(newIndex);

  // 获取兄弟节点的 ID
  const siblingId = parentNode.children[newIndex];
  // 更新 currentPage 为兄弟节点的索引
  parentNode.currentPage = newIndex + 1;

  console.log(siblingId);

  // 使用已有函数来找到以这个新兄弟节点为根的子树中最新createTime的叶子节点
  const subtreeNodes = getSubtreeNodes(siblingId, tempConv.value);
  console.log(subtreeNodes);
  const latestLeafNode = findLatestLeafNode(subtreeNodes);
  console.log(latestLeafNode);
  if (!latestLeafNode) {
    console.error("No latest leaf node found in the subtree.");
    return;
  }

  // 生成从这个叶子节点到根节点的路径
  const newPath = getPathToRoot(latestLeafNode.idx, tempConv.value);

  // 这里根据newPath更新UI
  // console.log("New Path:", newPath.map((node) => node.idx).join(" -> "));

  conversation.value = newPath;
  console.log(conversation.value);

  // 滚动条
};

const getLoading = ref(false);
const inputState = ref(true);

var es: any;
const stopConversion = async function () {
  abortRequest(1);
};

const server_error = "服务器返回出错，请重新生成！";
// 完整信息存入数据库
const saveData = function (data: any) {
  // var newConv = conversation.value[conversation.value.length - 1];
  try {
    console.log(data);
    if (data.input === "") {
      let newConv = conversation.value[conversation.value.length - 1];
      newConv.content = server_error;
      data.input = server_error;
    }
    let res = {
      data: {
        dialogue_create_time: "",
        dialogue_id: temp_dialogue_id.value + 1,
        topic_id: 1,
      },
    };
    temp_dialogue_id.value += 1; // 对话 id 自增
    console.log(res.data);
    // 需要更新树的结构

    return res;
  } catch (error) {
    console.log("存储失败：", error);
    return null;
  }
};

// https://github.com/InfiniTensor/transformer-rs/tree/main/web-api
const notAllowSend = function () {
  ElMessage({
    message: "输入不能为空，请调整输入！",
    type: "warning",
    // duration: 0,
    offset: 5,
    appendTo: "#inputArea",
  });
};
// 1.新对话，生成新的session_id
// 2.老对话，使用原来的session_id
// 3.对话历史丢失，需要传历史对话
// const cvs = ref();
const getData = async function (type: any) {
  // type == 1 增加对话  type == 2 修改对话
  if (getLoading.value) {
    console.log("正在加载");
  } else {
    getLoading.value = true;

    console.log(topicID.value);
    if (topicID.value == 0) {
      // 1.新对话，生成新的session_id
      await initUUID();
      // 初始化根节点
      tempConv.value = [];
      let dtinit = {
        speaker: "none",
        content: "root-null",
        loading: false,
        idx: 0,
        parentId: -1,
        children: [],
        currentPage: -1,
        create_time: "1",
        session_id: null,
      };
      // 初始化 虚拟 根节点
      // @ts-ignore
      tempConv.value.push(dtinit);
      topicID.value = 1;
    } else {
      // 2.老对话，使用原来的session_id，session需要从chat中获取，topic中的不是最新的
      // console.log(conversation.value[conversation.value.length - 1].session_id)
      // @ts-ignore
      myUuid.value = conversation.value[conversation.value.length - 1].session_id;
      console.log(topicItem.value);
      console.log(topicID.value);
    }

    let textInfo;
    if (type == 1) {
      textInfo = JSON.parse(JSON.stringify(textarea.value));
      textarea.value = "";
    } else {
      textInfo = JSON.parse(JSON.stringify(conversation.value[conversation.value.length - 1].content));
    }

    // 是否是第一次请求（第一次请求没有指定topicid）
    // let fr = topicID.value == 0 ? true : false;
    let dp = conversation.value.length - 1;

    console.log(myUuid.value);
    let saveRes;
    if (topicID.value == 0) {
      let dttopic = {
        input: textInfo,
        session_id: myUuid.value,
      };
      console.log(dttopic);
      try {
        // let resData = await aiTopicCreate(dttopic);
        // console.log(resData);
        // 创建话题后的第一次提问，parentId为0，指向null
        // if (topicID.value == 0) {
        triggerRefresh();
        // }
        let dt = {
          input: textInfo,
          parent_id: 0,
          topic_id: 1,
          session_id: myUuid.value,
          content_type: 1,
        };
        saveRes = saveData(dt);
      } catch (error) {
        console.log(error);
        return;
      }
    } else {
      // 已有的对话再添加对话，parentId为上一条数据的idx
      let dt = {
        input: textInfo,
        parent_id: conversation.value[conversation.value.length - 1].idx,
        topic_id: topicID.value,
        session_id: myUuid.value,
        content_type: 1,
      };
      saveRes = saveData(dt);
    }

    console.log(saveRes);
    let data = {
      speaker: "user",
      content: textInfo,
      loading: false,
      idx: saveRes.data.dialogue_id,
      isEdit: false, //重新编辑
      session_id: myUuid.value,
      parentId: conversation.value[conversation.value.length - 1].idx, // parentid就是之前的最后一条
      children: [],
      currentPage: -1,
    };
    console.log(data);
    // @ts-ignore
    // conversation.value.push(data);
    conversationAddItem(data);

    console.log(dp);
    await getInfer(textInfo, dp, 1);
  }
};

// 维护 conversation 和 tempConv
const conversationAddItem = function (data: any) {
  console.log(data);
  console.log(conversation.value);
  console.log(tempConv.value);

  const parentNode: any = tempConv.value.find((node: any) => node.idx === data.parentId);
  console.log(parentNode);
  parentNode.children.push(data.idx);

  console.log(parentNode)
  const childIndex = parentNode.children.indexOf(data.idx);
  if (childIndex !== -1) {
    parentNode.currentPage = childIndex + 1;
  }

  data.nodeInfo = {
    pPage: parentNode.currentPage, //兄弟节点的位置
    length: parentNode.children.length, //兄弟节点
  };

  console.log(data);

  // @ts-ignore
  tempConv.value.push(data);

  conversation.value.push(data);
  console.log(tempConv.value);
  console.log(conversation.value);
  // console.log(data);
  // console.log(data);
};

const timeout = 20000; // 超时时间设置为20秒
const controller = ref();

const getInfer = async function (textInfo: any, dp: any, type: any) {
  console.log(type);
  console.log(textInfo);
  console.log(dp);
  let inputs: any = [];

  if (systemSetup.value != "") {
    inputs.push({ role: "system", content: systemSetup.value });
  }
  conversation.value.forEach((item: any, index: any) => {
    if (item.speaker == "none" || item.content == "" || item.speaker == "default") {
    } else {
      inputs.push({ role: item.speaker, content: item.content });
    }
  });
  console.log(inputs);

  let data2 = {
    speaker: "assistant",
    content: "",
    loading: true,
    idx: -1,
    // idx: JSON.parse(JSON.stringify(tempConv.value.length)),
    isEdit: false, //重新编辑
    session_id: myUuid.value,
    parentId: conversation.value[conversation.value.length - 1].idx, // parentid就是之前的最后一条
    children: [],
    currentPage: -1,
    htmlContent: "",
  };

  // 通过重新生成进入，需要在一开始构建树形结构
  if (type == 2 || type == 4) {
    data2.parentId = conversation.value[conversation.value.length - 1].idx;
    // conversation.value.pop(); // 将原来的最后一项删除，通过 conversationAddItem 添加新的最后一项
  }

  // @ts-ignore
  console.log(data2);
  await conversationAddItem(data2);

  // 创建 AbortController 实例
  controller.value = new AbortController();
  // 添加一个定时器，如果4s仍然收不到任何respnse，则主动中断（一般代表服务器异常崩溃）
  let timeoutId = setTimeout(() => {
    if (controller.value) {
      abortRequest(1);
      console.log("请求超时，已中断");
    }
  }, timeout);

  console.log(myUuid.value);
  try {
    const response = await fetchRequest(inputs, dp);
    console.log(response);
    clearTimeout(timeoutId); // 清除定时器
    if (response) {
      await responseProcess(response, data2);
    } else {
    }
  } catch (error: any) {
    handleError(error, data2);
  }
};

const fetchRequest = async function (inputs: any, dp: any) {
  console.log("fetchRequest");
  const { signal } = controller.value;
  try {
    // 50/90/60
    let data = JSON.stringify({
      // session_id: myUuid.value,
      model: modelSelect.value,
      messages: inputs,
      stream: true,
      // max_tokens: 4096,
      // temperature: 0.8,
      // top_p: 0.8,
    });
    const headers: any = {
      "Content-Type": "application/json",
      Accept: "application/json",
      // Authorization: `Bearer ${JIUGETOKEN}`, // 使用 Bearer 方式添加令牌
    };
    if (authHeader.value) {
      headers[authHeader.value.name] = authHeader.value.value;
    }
    console.log(data);
    console.log(apiBaseUrl.value);
    // "http://172.22.162.195:8099/v1/chat/completions"
    const response = await fetch(`${apiBaseUrl.value}`, {
      method: "POST",
      signal,
      headers: headers,
      body: data,
    });
    if (!response.ok) {
      getLoading.value = false;
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    console.error("fetchRequest发生错误:", error);
    throw error; // 继续抛出错误，让调用者处理
  }
};

const responseProcess = async function (response: any, data2: any) {
  let indexNum: Number = 0;
  console.log("responseProcess");
  const reader: any = response.body?.getReader();
  let result: any = "";
  let done = false;

  console.log("start parse process");

  let newConv = conversation.value[conversation.value.length - 1];
  // let tempxxx;
  // 触发了解析但是topicid仍然没有，说明是新话题
  if (topicID.value == 0) {
    triggerRefresh();
  }

  while (!done) {
    const { value, done: streamDone } = await reader.read();

    if (value) {
      const decoder = new TextDecoder();
      result += decoder.decode(value);
      const lines = result.split("\n");
      result = lines.pop();

      for (const line of lines) {
        if (line.trim() === "") {
        } else {
          try {
            // console.log(line)
            // const json = JSON.parse(line)
            try {
              // Remove "data: " prefix from SSE data
              const jsonStr = line.replace("data: ", "");
              // console.log(jsonStr)
              const json = JSON.parse(jsonStr);
              // console.log('Parsed data:', json);

              if (json.choices && json.choices.length > 0) {
                const content = json.choices[0].delta.content;
                if (content) {
                  indexNum ++;
                  // nowContent.value += content;
                  newConv.content += content;
                  newConv.htmlContent = mdToHtml(newConv.content, newConv);
                }
              }
              if (json.choices && json.choices[0].finish_reason === "stop") {
                console.log("done");
                // emit("stopConv", 2);
                done = true;
                break;
              }
            } catch (e) {
              console.error("Error parsing data:", e);
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
    if (streamDone) {
      console.log("done2");
      // emit("stopConv", 2);
      done = true;
    }
  }

  console.log(indexNum);

  let dt = {
    input: newConv.content,
    parent_id: data2.parentId,
    topic_id: topicID.value,
    session_id: myUuid.value,
    content_type: 2,
  };

  let resData = await saveData(dt);
  newConv.idx = resData.data.dialogue_id;
  const node1: any = conversation.value.find((node: any) => node.idx === data2.parentId);
  const node2: any = tempConv.value.find((node: any) => node.idx === data2.parentId);
  const pIndex1 = node1.children.findIndex((item: any) => item === -1);
  const pIndex2 = node2.children.findIndex((item: any) => item === -1);

  node1.children[pIndex1] = resData.data.dialogue_id;
  node2.children[pIndex2] = resData.data.dialogue_id;

  getLoading.value = false;
  newConv = conversation.value[conversation.value.length - 1];
  newConv.loading = false;
  console.log(conversation.value);
  localStorage.removeItem("conv");
  localStorage.setItem("conv", JSON.stringify(tempConv.value));
  // localStorage.setItem("conv", JSON.stringify(conversation.value));
};

// 异常离开或者切换的标志  0:初始化  1:pickTopic  2:newTalk
const leaveFlag = ref(0);
const handleError = async function (error: any, data2: any) {
  if (error.name === "AbortError") {
    console.log("请求已被用户中断");
  } else {
    console.error("handleError发生错误:", error);
  }
  console.log(444);
  // 不管是什么错误，应该都需要保存
  let newConv = conversation.value[conversation.value.length - 1];
  console.log("getLoading.value = false; 3 ");
  // 2024-06-04 ghn
  getLoading.value = false;
  // newConv.loading = false;

  let dt = {
    input: newConv.content,
    parent_id: data2.parentId,
    topic_id: topicID.value,
    session_id: myUuid.value,
    content_type: 2,
  };
  console.log(leaveFlag.value);
  console.log(oldTopic.value);
  if (leaveFlag.value != 0 && oldTopic.value) {
    dt.topic_id = oldTopic.value.topic_id;
  }
  console.log(dt);
  let resData = await saveData(dt);
  newConv.idx = resData.data.dialogue_id;
  console.log(555);
  const node1: any = conversation.value.find((node: any) => node.idx === data2.parentId);
  const node2: any = tempConv.value.find((node: any) => node.idx === data2.parentId);
  const pIndex1 = node1.children.findIndex((item: any) => item === -1);
  const pIndex2 = node2.children.findIndex((item: any) => item === -1);
  node1.children[pIndex1] = resData.data.dialogue_id;
  node2.children[pIndex2] = resData.data.dialogue_id;
  console.log(666);
  // 如果是在推理过程中导致的，需要先存储，后初始化topic信息
  oldTopic.value = null;
  leaveFlag.value = 0;
  
};

// 主动中断请求，可能有很多情况都会触发
// 切换出去当前组件也需要中止并存储
const abortRequest = function (type: any) {
  console.log("-----------start stopConversion----------");
  console.log(controller.value);
  if (controller.value != null) {
    console.log("-----------stopConversion----------");
    if (type == 2) {
      // 如果是fork的话，不取消
    } else {
      getLoading.value = false;
    }

    if (type == 3) {
      leaveFlag.value = 1;
    } else if (type == 4) {
      leaveFlag.value = 2;
    }

    var newConv = conversation.value[conversation.value.length - 1];
    newConv.loading = false;

    controller.value.abort();
    controller.value = null;
  } else {
    getLoading.value = false;
    // ElMessage({
    //   message: "尚未进入对话，请稍后进行断开操作！",
    //   type: "warning",
    // });
  }
};

const forkData = async function (indexData: any, content: any, type: any) {
  if (type == 1) {
    getInfer(null, 0, 3);
  } else {
    getInfer(null, 0, 4);
  }
}

// 调整textarea高度的函数
const changeHeight = () => {
  // console.log("changeHeight");
  if (window.innerWidth <= 1440) {
    if (inputChat.value) {
      const elem = inputChat.value as HTMLTextAreaElement;
      elem.style.height = "20px";
      const scrollHeight = elem.scrollHeight;
      // console.log(inputChat);
      if (28 >= scrollHeight || textarea.value.length === 0) {
        resetHeight();
        return;
      }

      elem.style.removeProperty("overflow-y");
      elem.style.height = scrollHeight + "px";

      const eleBtn = inputBtn.value as HTMLTextAreaElement;
      const nowHeight = elem.offsetHeight;
      console.log(nowHeight);
      eleBtn.style.height = nowHeight + "px";
    }
    config.font.fontSize = 12;
    config.gap = [50, 50] as [number, number];
  } else {
    if (inputChat.value) {
      const elem = inputChat.value as HTMLTextAreaElement;
      elem.style.height = "32px";
      const scrollHeight = elem.scrollHeight;
      // console.log(scrollHeight);
      if (32 >= scrollHeight || textarea.value.length === 0) {
        resetHeight();
        return;
      }

      elem.style.removeProperty("overflow-y");
      elem.style.height = scrollHeight + "px";

      const eleBtn = inputBtn.value as HTMLTextAreaElement;
      const nowHeight = elem.offsetHeight;
      console.log(nowHeight);
      eleBtn.style.height = nowHeight + "px";
    }
  }
  console.log("changeHeight");
};

// 重置textarea高度
const resetHeight = () => {
  if (window.innerWidth < 1440) {
    if (inputChat.value) {
      const elem = inputChat.value as HTMLTextAreaElement;
      elem.style.height = "20px";
      elem.style.overflowY = "hidden";

      const eleBtn = inputBtn.value as HTMLTextAreaElement;
      eleBtn.style.height = "32px";
    }
  } else {
    if (inputChat.value) {
      const elem = inputChat.value as HTMLTextAreaElement;
      elem.style.height = "32px";
      elem.style.overflowY = "hidden";

      const eleBtn = inputBtn.value as HTMLTextAreaElement;
      eleBtn.style.height = "40px";
    }
  }
};

// 添加一个辅助函数来转义 HTML 特殊字符
const escapeHtml = function (html: any) {
  return html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
};

// 初始化marked，添加对代码部分的渲染
const renderMarkdown = function () {
  const renderer = {
    // @ts-ignore
    code(code: any, infostring: any, escaped: any) {
      // var codeHtml = code;
      var codeHtml = escapeHtml(code); // 先转义代码
      // console.log(infostring);
      if (infostring && infostring == "html") {
        console.log("encodeURIComponent");
        codeHtml = encodeURIComponent(code);
      }
      if (infostring) {
        // console.log("hljs");
        codeHtml = hljs.highlightAuto(code).value;
      }
      if (infostring.trim() === "") {
        infostring = "bash";
      }
      // console.log(code, infostring, escaped, codeHtml);
      return `<div class="bg-white mb-4 rounded-md">
      <div class="code_header flex items-center relative text-gray-200 bg-gray-800 px-4 py-2 text-xs font-sans">
        <span>${infostring || ""}</span>
        <button onclick="copy(this)" class="copy-btn">
          <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          </svg>
          <span>Copy code</span>
          <code style="display:none">${encodeURIComponent(code)}</code>
        </button>
      </div>

      <div class="p-4 overflow-y-auto">
        <code class="whitespace-pre hljs language-${infostring}">${codeHtml}</code>
      </div>
    </div>`;
    },
    paragraph(text: any) {
      // console.log(text);
      return `<p style="white-space:pre-wrap;">${text}</p >`;
    },
  };
  marked.use({ renderer });
};

// @ts-ignore
const mdToHtml = function (md: any, conv: any) {
  // console.log(md)
  if (md == "") {
    return "<p></p>";
  }
  // md = this.countAndConcat(md, "```")
  // console.log(md)
  var htmlMD = marked.parse(md);
  htmlMD = htmlMD.trim();
  return htmlMD;
};

// 通过getCurrentInstance方法获取上下文，这里的proxy就相当于this
const { proxy } = getCurrentInstance() as any;
// @ts-ignore
const vueCopy = function (node: any) {
  var code = node.getElementsByTagName("code")[0].innerHTML;
  var text = decodeURIComponent(code);
  proxy.$copyText(text).then(
    // @ts-ignore
    (res: any) => {
      var svg = `<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Copied!</span>`;
      const nodeInnerHtml = node.innerHTML;
      node.innerHTML = svg;

      setTimeout(() => {
        node.innerHTML = nodeInnerHtml;
      }, 1000);
    },
    // @ts-ignore
    (err: any) => {
      console.log("复制失败");
    }
  );
};

const isAutoScrollEnabled = ref(true); // 控制自动滚动
// 随着对话滚动到底部，（如果用户控制了则不滚动，如果用户滚到了最下面那么触发自动滚动）
// 类型“HTMLElement”上不存在属性“$el”
const scrollArea = ref<ComponentPublicInstance | null>(null);
const scrollToBottom = async () => {
  // 如果用户已滚动查看旧信息，则不自动滚动至底部
  const container = scrollArea.value?.$el.querySelector(".el-scrollbar__wrap");
  if (!isAutoScrollEnabled.value) {
    // console.log("===========not allow auto scrollToBottom=============");
  } else if (isSwitchable.value) {
    await nextTick();
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  } else {
    await nextTick();
    container.scrollTo({ top: container.scrollHeight });
  }
  isSwitchable.value = false;
};

const scrollToBottomManual = async () => {
  const container = scrollArea.value?.$el.querySelector(".el-scrollbar__wrap");
  container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
};

const onScroll = () => {
  // console.log(isAutoScrollEnabled.value);
  const container = scrollArea.value?.$el.querySelector(".el-scrollbar__wrap");
  if (!container) return;
  // 计算距离底部的距离
  const distanceToBottom = container.scrollHeight - (container.scrollTop + container.clientHeight);
  // console.log(distanceToBottom)
  // 如果距离底部的距离小于或等于10px，则认为是自动滚动状态
  isAutoScrollEnabled.value = distanceToBottom <= 10;
  // console.log(isAutoScrollEnabled.value);
};

const copyMD = function (item: any) {
  console.log(item.content);
  let msg = item.content;
  copyToClipboard(msg);
};

// @ts-ignore
const copyJustText = function (item: any, index: number) {
  const markdownElements = document.querySelectorAll(".ai");
  console.log(markdownElements);
  console.log(index / 2);
  console.log(markdownElements[Math.floor(index / 2)]);
  if (markdownElements[Math.floor(index / 2)]) {
    const plainText = markdownElements[Math.floor(index / 2)].textContent;
    console.log(plainText);
    copyToClipboard(plainText);
  }
};

const copyToClipboard = (text: any) => {
  proxy.$copyText(text).then(
    function (e: any) {
      ElMessage({
        message: "复制成功",
        type: "success",
      });
      console.log(e);
    },
    function (e: any) {
      ElMessage({
        message: "复制失败",
        type: "warning",
      });
      console.log(e);
    }
  );
};

const rebuildChat = async function (item: any, index: number) {
  console.log(item.content);
  console.log(index);

  // fork的时候停止是无效的，因为还没有新的signal产生，所以也不显示加载
  console.log("getLoading2 ===== true");
  getLoading.value = true;

  // 将原来的最后一项删除，在 getInfer 中通过 conversationAddItem 添加新的最后一项
  conversation.value.pop();
  // 创建新的session_id
  await initUUID();

  console.log(item);
  let indexData = {
    session_id: item.session_id,
    new_session_id: myUuid.value,
  };

  const parentNode: any = tempConv.value.find((node: any) => node.idx === item.parentId);

  try {
    // 组织新的对话
    // await addNewBranch(newBranchData);
    // fork 原来的对话
    await forkData(indexData, parentNode.content, 2);
    // fork 后再进行对话
    // setTimeout(() => {
    //   getInfer(parentNode.content, conversation.value.length - 2, 2);
    // }, 1000); // 设置延迟时间，这里是1秒（1000毫秒）
  } catch (e) {}
};

const isEdit = ref(false);
const editText = ref();
const editRef = ref();
const editRefOut = ref(null);
const allOutDiv = ref();
// const initPosition = ref(0);
// const textPosition = ref(0);
let erd: any = null;
// 编辑对话
var editIndex = -1;
const reEdit = async function (item: any, index: number) {
  console.log(index);
  console.log(conversation.value);
  if (editIndex != -1) {
    conversation.value[editIndex].isEdit = false;
  }
  item.isEdit = true;
  editText.value = item.content;
  isEdit.value = true;
  // 记录当前节点变为正在编辑的节点
  editIndex = index;
};

const reReEdit = async function (item: any, index: number) {
  item.isEdit = false;
  isEdit.value = false;
  console.log(item);
  unSupportInput.value = 0;

  // fork的时候停止是无效的，因为还没有新的signal产生
  getLoading.value = true;
  console.log("getLoading ===== true");

  // 创建新的session_id
  await initUUID();

  let dt = {
    input: item.content,
    parent_id: item.parentId,
    topic_id: topicID.value,
    session_id: myUuid.value,
    content_type: 1,
  };
  console.log(dt);
  let saveRes = await saveData(dt);
  console.log(saveRes);
  console.log(saveRes.data.dialogue_id);

  let indexData = {
    session_id: item.session_id,
    new_session_id: myUuid.value,
  };

  console.log(item);
  console.log(indexData);
  let newBranchData = JSON.parse(JSON.stringify(item));
  newBranchData.children = [];
  newBranchData.content = item.content;
  newBranchData.idx = saveRes.data.dialogue_id;
  newBranchData.nodeInfo.pPage += 1;
  newBranchData.nodeInfo.length += 1;
  newBranchData.currentPage = newBranchData.nodeInfo.pPage;
  newBranchData.create_time = saveRes.data.dialogue_create_time;
  console.log(newBranchData);
  try {
    await addNewBranch(newBranchData);
    await forkData(indexData, newBranchData.content, 1);
  } catch (e) {
    // console.log(e);
  }
};

// const confirmReEdit = async function (item: any, index: number) {
//   console.log(conversation.value)
// }
// 对话是一棵树形结构，TreeNode，切换分支
const confirmReEdit = async function (item: any, index: number) {
  item.isEdit = false;
  isEdit.value = false;
  console.log(item);
  // fork的时候停止是无效的，因为还没有新的signal产生
  getLoading.value = true;
  console.log("getLoading ===== true");
  // 创建新的session_id
  await initUUID();

  let dt = {
    input: editText.value,
    parent_id: item.parentId,
    topic_id: topicID.value,
    session_id: myUuid.value,
    content_type: 1,
  };
  console.log(dt);
  let saveRes = await saveData(dt);
  console.log(saveRes);
  console.log(saveRes.data.dialogue_id);

  let indexData = {
    session_id: item.session_id,
    new_session_id: myUuid.value,
  };

  console.log(item);
  console.log(indexData);
  let newBranchData = JSON.parse(JSON.stringify(item));
  newBranchData.children = [];
  newBranchData.content = editText.value;
  // saveRes.data.dialogue_id
  newBranchData.idx = saveRes.data.dialogue_id;
  newBranchData.nodeInfo.pPage += 1;
  newBranchData.nodeInfo.length += 1;
  newBranchData.currentPage = newBranchData.nodeInfo.pPage;
  newBranchData.create_time = saveRes.data.dialogue_create_time;
  console.log(newBranchData);
  try {
    // 组织新的对话
    await addNewBranch(newBranchData);
    // fork 原来的对话
    await forkData(indexData, newBranchData.content, 1);
    // fork 后再进行对话
    // console.log(newBranchData.content);
    // console.log(conversation.value);
    // console.log(conversation.value.length - 2);
    // setTimeout(() => {
    //   getInfer(newBranchData.content, conversation.value.length - 2, 1);
    // }, 1000); // 设置延迟时间，这里是1秒（1000毫秒）
  } catch (e) {
    // console.log(e);
  }
};

const addNewBranch = async function (newBranchData: any) {
  let data = {
    speaker: newBranchData.speaker,
    content: newBranchData.content,
    loading: false,
    idx: newBranchData.idx,
    isEdit: false, //重新编辑
    session_id: newBranchData.session_id,
    parentId: newBranchData.parentId,
    create_time: newBranchData.create_time,
    children: newBranchData.children,
    currentPage: -1,
  };

  // 查找父节点，更新 currentPage 索引
  const parentNode: any = tempConv.value.find((node: any) => node.idx === data.parentId);
  parentNode.currentPage = newBranchData.nodeInfo.pPage;

  console.log(parentNode);
  // 找到 parentId 在数组中的索引
  const parentIndex = conversation.value.findIndex((item) => item.idx === parentNode.idx);
  if (parentIndex === -1) {
    console.error("Parent ID not found in the conversation.");
    return; // 如果未找到 parentId，不执行任何操作
  }

  // 删除 parentIndex 之后的所有对话
  conversation.value.splice(parentIndex + 1);
  // 添加新的对话内容
  // conversation.value.push(newBranchData);
  console.log(conversation.value);
  await conversationAddItem(data);

  console.log("=====================");
  console.log(conversation.value);
  // 触发Vue的响应式更新
  conversation.value = [...conversation.value];
};

const cancelReEdit = function (item: any, index: number) {
  item.isEdit = false;
  isEdit.value = false;
};

const adjustScrollForTextarea = async () => {
  // const container = scrollArea.value?.$el.querySelector('.el-scrollbar__wrap');
  // const textarea = editRef.value[0];
  // if (!container || !textarea) return;
  // container.scrollTo({ top: container.scrollTop - 100, behavior: 'smooth' });
};

const goodResponse = function () {
  ElMessage({
    message: "已反馈，谢谢您的支持",
    type: "success",
  });
};

const badResponse = function () {
  ElMessage({
    message: "已反馈，谢谢您的支持",
    type: "success",
  });
};

// 定义响应式数据用于存储屏幕宽度
const screenWidth = ref(window.innerWidth);
// 更新屏幕宽度的函数
const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth;
};
const textareaClass = computed(() => {
  if (screenWidth.value > 1920) {
    return "large-textarea"; // 大尺寸
  } else if (screenWidth.value > 1440 && screenWidth.value <= 1920) {
    return "medium-textarea"; // 中等尺寸
  } else {
    return "small-textarea";
  }
});

const unSupportInput = ref(0);
// 如果服务器连接出错或无返回值，不再允许输入，只允许重新生成或修改输入
const judgeInputState = async function () {
  let len = conversation.value.length;
  // console.log(conversation.value[len - 1]);
  if (conversation.value[len - 1].content == server_error) {
    unSupportInput.value = 1;
  } else if (conversation.value[len - 1].speaker === "user") {
    // 如果最后一条是用户信息，代表没有返回，也不允许输入
    unSupportInput.value = 2;
  } else {
    unSupportInput.value = 0;
    await nextTick();
    if (inputChat.value) {
      await changeHeight();
    }
  }
  // console.log(unSupportInput.value);
};

const beforeUnloadHandler = function (e: any) {
  if (getLoading.value) {
    abortRequest(1);
  }
};

const initTemp = function(){
  // let data = {
  //         speaker: "user",
  //         content: item.text,
  //         loading: false,
  //         idx: item.id,
  //         isEdit: false, //重新编辑
  //         session_id: item.session_id,
  //         parentId: item.parent_id,
  //         create_time: item.create_time,
  //         children: item.children_ids,
  //         currentPage: -1,
  //       };
  //       // @ts-ignore
  //       tempConv.value.push(data);
  console.log(conversation.value);
  console.log(tempConv.value);
  showDialogueList();
}

const clearChat = function () {
  localStorage.removeItem("conv");
  conversation.value = JSON.parse(JSON.stringify(initConversation.value));
  console.log(conversation.value);
};

const downloadChat = function () {
  // 将数组转换为字符串，每个对象包含提问和回答，并在对象之间添加分隔符
  const arrayString = conversation.value
    .map((item) => {
      return `Speaker: ${item.speaker}\nContent:\n${item.content}\n`;
    })
    .join("\n---\n");

  // 创建 Blob 对象并生成 URL
  const blob = new Blob([arrayString], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  // 创建临时的 <a> 元素并设置其属性以触发下载
  const a = document.createElement("a");
  a.href = url;
  a.download = "QA.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};


// 在组件挂载后初始化
onMounted(async () => {
  // localStorage.getItem("")
  let ccc: any = localStorage.getItem("conv");
  if (ccc) {
    topicID.value = 1;
    // conversation.value = JSON.parse(ccc);
    initTemp();
  }

  (window as any).copy = vueCopy;
  // initUUID();
  initConf();
  await renderMarkdown();
  if (inputChat.value) {
    changeHeight();
  }

  const container = scrollArea.value?.$el.querySelector(".el-scrollbar__wrap");
  if (container) {
    container.addEventListener("scroll", onScroll);
  }

  window.addEventListener("resize", updateScreenWidth);
  window.addEventListener("beforeunload", beforeUnloadHandler);
});

onUnmounted(() => {
  const container = scrollArea.value?.$el.querySelector(".el-scrollbar__wrap");
  if (container) {
    container.removeEventListener("scroll", onScroll);
  }
  window.removeEventListener("resize", updateScreenWidth);
  window.removeEventListener("beforeunload", beforeUnloadHandler);
});

// 数组变化，监听触发滚动条
// @ts-ignore
watch(
  conversation,
  (newVal, oldVal) => {
    // 如果最新生成的ai内容变化，就向下滚
    // console.log(newVal[newVal.length-1]!== oldVal[newVal.length-1])
    // console.log("change conversation");
    if (!isEdit.value) {
      scrollToBottom();
    }
    judgeInputState();
  },
  { deep: true }
);

// 监听textarea的内容变化
watch(
  () => textarea.value,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      changeHeight();
    }
  }
);

// 监听textarea的内容变化
watch(
  () => editText.value,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      adjustScrollForTextarea();
    }
  }
);

// 监听变量变化并更新 Pinia Store
watch([value1, value2, value3], ([newVal1, newVal2, newVal3]) => {
  let data = {
    topK: newVal1,
    topP: newVal2,
    temperature: newVal3,
  };
  updateLLmParams(data);
});
</script>

<style scoped>
.conf-btn{
  position: absolute;
  background: #b1e0fb;
  top: 40px;
}

.conf-btn-2{
  margin-left: 0;
  position: absolute;
  background: #b1e0fb;
  top: 80px;
}

.conf-btn-3{
  margin-left: 0;
  position: absolute;
  background: #b1e0fb;
  top: 120px;
}

.use-method {
  position: absolute;
  right: 35px;
  top: 30px;
  z-index: 1000;
}

.side_menu {
  width: 75px;
  /* height: 520px; */
  background-color: #283cc4;
  border-radius: 10px;
  padding: 8px;
  position: absolute;
  right: -5px;
  top: -1px;
  transition: width 0.3s ease;
  /* box-shadow: 3px 4px 16px rgba(2, 84, 172, 0.4); */
}

.menu_item {
  color: #fff;
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  position: relative;
  transition: background-color 0.3s linear;
}

.big-menu_item {
  padding: 0 8px 0 5.6px;
}

.menu_item i {
  font-size: 16px;
}

.menu_text {
  max-width: 0;
  overflow: hidden;
  white-space: nowrap;
  opacity: 0;
  transition: max-width 0.5s ease, opacity 0.5s ease;
  margin-left: 8px;
}

.menu_item:hover {
  background-color: #0467d1;
}

/* popover气泡提示 */
.popover {
  position: absolute;
  top: 50%;
  right: calc(100% + 5px);
  transform: translateY(-50%);
  display: none;
  background-color: #fff;
  border-radius: 2px;
  padding: 8px;
  color: #333;
  font-size: 12px;
  box-shadow: 0px 6px 6px rgb(0 0 0 / 10%);
}

/* css三角形: arrow-left */
.popover::before {
  content: "";
  position: absolute;
  border-width: 6px;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  border-style: solid;
  border-right-color: #fff;
  border-top-color: transparent;
  border-left-color: transparent;
  border-bottom-color: transparent;
}

.toggle {
  /* position: absolute; */
  margin-top: 40px;
  width: calc(100%);
  padding: 0;
  /* bottom: 10px; */
  justify-content: center;
}

.toggle i {
  font-size: 16px;
  transition: transform 0.3s ease;
}

/* collapsible时动效 */
.side_menu.collapsible {
  width: 36px;
}

.side_menu:not(.collapsible) .menu_text {
  max-width: 200px;
  opacity: 1;
}

.side_menu.collapsible .menu_text {
  max-width: 0;
  opacity: 0;
}

.side_menu.collapsible .toggle i {
  transform: rotate(180deg);
}

.side_menu.collapsible .menu_item:hover .popover {
  display: inline-block;
}

.side-img {
  height: 20px;
  width: 20px;
  min-width: 20px;
}
.big-side-img {
  height: 24px;
  width: 24px;
  min-width: 24px;
}

.small-side-img {
  height: 18px;
  width: 18px;
  min-width: 18px;
  margin-left: 1px;
}

@media only screen and (max-width: 1440px) {

  .side_menu {
    right: -10px;
    top: -6px;
  }
}

</style>

<style>

</style>