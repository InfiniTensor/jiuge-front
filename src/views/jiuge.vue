<template>
  <div class="aichat-main">
    <!-- <div class="header-r"></div> -->
    <div class="chat-class">
      <el-button class="conf-btn-1" @click="openForm">设置</el-button>
      <el-button class="conf-btn-2" @click="clearChat">清空</el-button>
      <el-button class="conf-btn-3" @click="downloadChat">下载</el-button>
      <!-- <div class="left-menu">
        <div style="height: calc(100% - 0px); margin-top: 0px">
          <HistoryChat @pickTopic="pickTopic" @newTalk="newTalk" @getNewTopicId="getNewTopicId" @deleteNowTopic="deleNowTopic" :refreshSignal="refreshSignal"></HistoryChat>
        </div>
      </div> -->

      <div class="feed-out">
        <ApiSet ref="apiSetRef" :type="1" :isOpen="isOpen" @close-card="handleCloseCard"></ApiSet>
      </div>

      <div class="model-pick">
        <div :class="['dropdown-container', { expanded: isExpanded }]" :style="boxStyle" ref="confPlace">
          <div class="dd-header" @click="showNumber">
            <div>九格大模型</div>
            <div v-if="isExpanded">
              <el-button class="conf-btn" @click.stop="backConf" text>
                <svg class="icon3" aria-hidden="true">
                  <use xlink:href="#icon-zhongxinshengcheng"></use>
                </svg>
              </el-button>
            </div>
          </div>
          <el-collapse-transition>
            <div class="dd-content" :style="sliderContainerStyle" v-show="isExpanded">
              <div class="slider-outer">
                <div class="left-label">top-k:</div>
                <el-slider v-model="value1" :marks="marks1" :step="5" :format-tooltip="formatTooltip" />
              </div>
              <div class="slider-outer">
                <div class="left-label">top-p:</div>
                <el-slider v-model="value2" :marks="marks2" :step="10" :format-tooltip="formatTooltip2" />
              </div>
              <div class="slider-outer">
                <div class="left-label">temperature:</div>
                <el-slider v-model="value3" :marks="marks3" :format-tooltip="formatTooltip3" :step="5" />
              </div>
            </div>
          </el-collapse-transition>
        </div>
      </div>
      <el-scrollbar ref="scrollArea" class="scroll-area" style="width: 100%; height: calc(100% - 150px); margin-top: 30px">
        <el-watermark :content="['启元AI', '生成内容仅供参考']" :gap="config.gap" :z-index="config.zIndex" :font="config.font">
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
                          <!-- v-if="!conv.loading && !getLoading && i > conversation.length - 3" -->
                          <div class="own-pagnation">
                            <div v-if="conv.nodeInfo && conv.nodeInfo.length != 1" style="display: flex; align-items: center">
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
                          <el-button link class="btn-tooltip" @click="cancelReEdit(conv, i)" style="margin-left: 4px">
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
              <div v-if="conv.speaker == 'assistant' || conv.speaker == 'system'" class="ai">
                <div class="ai-content" :class="{ 'last-item-ai': i == conversation.length - 1 }">
                  <div class="ai-inner">
                    <div class="user">
                      <el-image :src="aiAvatar" class="ai-img"></el-image>
                    </div>
                    <div class="ai-c1">
                      <!-- v-html="markdownToHtml" -->
                      <div class="ai-c2" :class="{ 'warn-outer': conv.content == server_error }">
                        <div v-if="conv.speaker == 'system'" class="ai-title">
                          {{ conv.title }}
                        </div>
                        <div class="warn-icon" v-if="conv.content == server_error">
                          <svg class="icon2" aria-hidden="true">
                            <use xlink:href="#icon-jinggao3"></use>
                          </svg>
                        </div>
                        <div
                          :class="{ 'result-streaming': getLoading && conversation.length - 1 == i, 'warn-content': conv.content == server_error }"
                          class="c2"
                          v-html="mdToHtml(conv.content, conv)"
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
                            <!-- <el-button link :icon="CopyDocument" title="复制纯文本" @click="copyJustText(conv, i)"></el-button> -->
                            <!-- <el-tooltip class="box-item" effect="dark" content="积极反馈" placement="bottom">
                              <el-button link class="btn-tooltip" @click="goodResponse(conv)" circle>
                                <svg class="icon1" aria-hidden="true">
                                  <use xlink:href="#icon-fabulous"></use>
                                </svg>
                              </el-button>
                            </el-tooltip>
                            <el-divider direction="vertical" />
                            <el-tooltip class="box-item" effect="dark" content="消极反馈" placement="bottom">
                              <el-button link class="btn-tooltip" @click="badResponse(conv)" circle>
                                <svg class="icon1" aria-hidden="true" style="margin-top: 1px">
                                  <use xlink:href="#icon-diancai"></use>
                                </svg>
                              </el-button>
                            </el-tooltip> -->
                            <el-divider direction="vertical" />
                            <el-tooltip class="box-item" effect="dark" content="复制markdown" placement="bottom">
                              <el-button link @click="copyMD(conv)" class="btn-tooltip" circle>
                                <svg class="icon3" aria-hidden="true">
                                  <use xlink:href="#icon-fuzhi2"></use>
                                </svg>
                              </el-button>
                            </el-tooltip>
                            <el-divider direction="vertical" v-if="i == conversation.length - 1 && conv.idx != 1" />
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
import { CaretBottom, CaretRight, DocumentCopy, CopyDocument, RefreshRight, Document, Picture, Edit, EditPen, Pouring, Sunny, CircleCheck, CircleClose } from "@element-plus/icons-vue";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { getAssetsFile } from "@/utils/tools.js";
const ApiSet = defineAsyncComponent(() => import("@/views/ApiSet.vue"));

import axios from "axios";
import type { CSSProperties } from "vue";
import { storeToRefs } from "pinia";
import { useJiuyuan } from "@/store";
import { create } from "domain";

const isOpen = ref(false);
const apiSetRef = ref();
const openForm = function () {
  isOpen.value = !isOpen.value;
};
const handleCloseCard = function () {
  isOpen.value = false;
};

const jiuyuan = useJiuyuan();
const { llmParam, jiugeAuthHeader, jiugeApiBaseUrl } = storeToRefs(jiuyuan);

watch(jiugeApiBaseUrl, (newVal) => {
  console.log("API Base URL changed:", newVal);
  // 在这里执行你需要的操作，例如更新页面显示
});

const updateLLmParams = function (data: any) {
  jiuyuan.seyLlmParams(data);
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

// const router = useRouter();
// const turnToPage = function () {
//   router.push({ name: "MultiAiChat" });
// };

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

// onBeforeRouteLeave((to, from) => {
//   if (getLoading.value) {
//     abortRequest(1);
//   }
// });

// const inputArea = ref();
const modelName = ref("九格大模型");
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
const aiAvatar = getAssetsFile("image/qiyuan-logo.png");

const textarea = ref("");
const inputChat = ref();
const inputBtn = ref();

const initPrompt = ref([{ content: "我可以跟你进行多轮对话与互动" }, { content: "我可以依据提问给出信息并进一步解读" }, { content: "我可以持续学习各行各业的高质量知识" }]);

const initConversation = ref([
  {
    speaker: "system",
    title: "Hi，我是启元AI助手",
    content: "让我协助你了解知识、获得灵感、提升效率。",
    loading: false,
    isStart: true,
    idx: 0,
    parentId: -1,
  },
]);

const conversation = ref([
  {
    speaker: "system",
    title: "Hi，我是启元AI助手",
    content: "让我协助你了解知识、获得灵感、提升效率。",
    loading: false,
    isStart: true,
    idx: 0,
    parentId: -1,
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

const decodeUnicodeStr = function (unicodeStr: any) {
  return unicodeStr.replace(/\\u([\dA-F]{4})/gi, function (match: any, grp: any) {
    return String.fromCharCode(parseInt(grp, 16));
  });
};

const test = function () {
  console.log(conversation.value);
};

const tempConv = ref([]);
// 滚动条是否平滑滚动，如果是切换分支，需要滑动，如果是api的信息，则不平滑（因为信息来源的数据发送问题）
const isSwitchable = ref(false);
const showDialogueList = async function () {
  // 每次进入后会把原来的记录留存，需要初始化
  // console.log(tempConv.value);
  tempConv.value = JSON.parse(localStorage.getItem("jiugeConv"));
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
  console.log(pathToRoot);
  // 根据pathToRoot来更新UI显示的实际对话
  console.log(pathToRoot);
  conversation.value = pathToRoot;
  // console.log("Path to root:", pathToRoot.map(node => node.id).join(" -> "));
  console.log(conversation.value);
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
  console.log(parentNode);
  if (!parentNode) {
    console.error("Parent node not found.");
    return;
  }

  // 在父节点的 children 中找到当前节点的位置
  const currentIndex = parentNode.children.indexOf(currentNodeId);
  console.log(currentIndex);
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
        dialogue_create_time: new Date().getTime(),
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
  console.log(conversation.value);
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
        console.log(dt);
        saveRes = saveData(dt);
      } catch (error) {
        console.log(error);
        return;
      }
    } else {
      // 已有的对话再添加对话，parentId为上一条数据的idx
      console.log(conversation.value[conversation.value.length - 1].idx);
      let dt = {
        input: textInfo,
        parent_id: conversation.value[conversation.value.length - 1].idx,
        topic_id: topicID.value,
        session_id: myUuid.value,
        content_type: 1,
      };
      console.log(dt);
      saveRes = saveData(dt);
      console.log(saveRes);
      console.log(saveRes.data.dialogue_id);
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

  const childIndex = parentNode.children.indexOf(data.idx);
  if (childIndex !== -1) {
    parentNode.currentPage = childIndex + 1;
  }
  data.nodeInfo = {
    pPage: parentNode.currentPage, //兄弟节点的位置
    length: parentNode.children.length, //兄弟节点
  };

  console.log(data);

  data.create_time = new Date().getTime();
  // @ts-ignore
  tempConv.value.push(data);

  conversation.value.push(data);
};

const timeout = 4000; // 超时时间设置为4秒
const controller = ref();
// type
// 1 正常请求进入，inputs是单条请求
// 2 重新生成进入，需要在一开始构建树形结构
// 3 fork丢失进入，inputs不是单条
// 4 重新生成的fork丢失进入，需要在一开始构建树形结构，且inputs不是单条
const getInfer = async function (textInfo: any, dp: any, type: any) {
  console.log(type);
  console.log(textInfo);
  console.log(dp);
  let inputs = [];
  if (type == 3 || type == 4) {
    conversation.value.forEach((item: any, index: any) => {
      if (item.speaker == "none" || item.content == "" || item.speaker == "system") {
      } else {
        inputs.push({ role: item.speaker, content: item.content });
      }
    });
  } else {
    inputs.push({ role: "user", content: textInfo });
  }
  console.log(inputs);

  let data2 = {
    speaker: "assistant",
    content: "",
    loading: true,
    idx: -1,
    isEdit: false, //重新编辑
    session_id: myUuid.value,
    parentId: conversation.value[conversation.value.length - 1].idx, // parentid就是之前的最后一条
    children: [],
    currentPage: -1,
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

// const token = JIUGETOKEN;  // 替换为您的实际令牌

const fetchRequest = async function (inputs: any, dp: any) {
  console.log("fetchRequest");
  const { signal } = controller.value;
  try {
    // 50/90/60
    let data = JSON.stringify({
      session_id: myUuid.value,
      messages: inputs,
      dialog_pos: dp,
      encoding: "text",
      "top-k": value1.value * 2,
      "top-p": value2.value / 100,
      temperature: value3.value / 50,
    });
    console.log(data);
    // infer
    console.log(jiugeApiBaseUrl.value);

    const headers: any = {
      "Content-Type": "application/json",
      Accept: "application/json",
      // Authorization: `Bearer ${JIUGETOKEN}`, // 使用 Bearer 方式添加令牌
    };
    if (jiugeAuthHeader.value) {
      headers[jiugeAuthHeader.value.name] = jiugeAuthHeader.value.value;
    }
    const response = await fetch(`${jiugeApiBaseUrl.value}/infer`, {
      method: "POST",
      signal,
      headers: headers,
      body: data,
    });

    if (!response.ok) {
      if (response.status === 404) {
        // const errorData = await response.json();
        const errorData = response;
        console.log(errorData);

        const contentType = response.headers.get("Content-Type");
        console.log(contentType);
        if (contentType != "text/html") {
          // 后端返回的 404，解析 JSON
          const errorData = await response.json();
          if (errorData.status === 404) {
            // 如果错误是由于会话丢失或会话忙，则直接处理这些错误
            uploadHistory();
            return null;
          }
        } else if (errorData.statusText.startsWith("Not Found")) {
          // 系统返回的 404，直接处理
          console.log("Sorry, Page Not Found");
          uploadHistory();
          return null;
        } else {
          console.log("getLoading.value = false; 1 ");
          getLoading.value = false;
        }
      } else if (response.status === 406) {
        const errorData = await response.json();
        if (errorData.status === 406) {
          ElMessage({
            message: "该会话正在推理中，不可重复进入推理服务，请稍后重试！",
            type: "warning",
          });
        }
      } else if (response.status === 409) {
        const errorData = await response.json();
        if (errorData.status === 409) {
        }
      } else if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.status === 400) {
        }
      } else if (response.status === 416) {
        const errorData = await response.json();
        if (errorData.status === 416) {
        }
      } else {
        // console.log("停止生成");
        console.log("getLoading.value = false; 2 ");
        getLoading.value = false;
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // 添加访问失败的动作，需要初始化某些变量
      console.log("停止生成");
      // console.log(response);
      // console.log(response.status);
      // throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error("fetchRequest发生错误:", error);
    // return null;
    throw error; // 继续抛出错误，让调用者处理
  }
};

const responseProcess = async function (response: any, data2: any) {
  console.log("responseProcess");
  const reader: any = response.body?.getReader();
  let result: any = "";
  let done = false;

  console.log("start parse process");

  let newConv = conversation.value[conversation.value.length - 1];

  // 触发了解析但是topicid仍然没有，说明是新话题
  if (topicID.value == 0) {
    triggerRefresh();
  }

  while (!done) {
    const { value, done: streamDone } = await reader.read();
    let lostState = "Session histroy is lost";
    let busyState = "Session is busy";
    if (value) {
      // console.log(value);
      const decoder = new TextDecoder("utf-8");
      // console.log(decoder);
      result += decoder.decode(value);
      // console.log(result);
      try {
        const obj = JSON.parse(result);
        console.log(obj);
        if (obj.error === lostState) {
          // console.log("历史信息丢失，等待上传！")
          throw new Error(lostState);
        } else if (obj.error === busyState) {
          // console.log("该会话正在推理中，不可重复进入推理服务！")
          throw new Error(busyState);
        } else {
          console.log(obj);
        }
      } catch (e: any) {
        // console.log("不能解析，是正常信息");
        // 将转义的换行符\\n替换为真正的换行符\n
        // let formattedData = result.replace(/\\n/g, "\n");
        // 替换转义字符为实际字符
        let formattedData = result
          .replace(/\\"/g, '"') // 替换转义的双引号
          .replace(/\\n/g, "\n") // 替换转义的换行符
          .replace(/\\\\/g, "\\") // 替换转义的反斜杠
          .replace(/\\_/g, "_"); // 替换转义的下划线;
        newConv.content = formattedData;
        // console.log(newConv.content)
      }
    } else {
      // 接收结束
      done = true;
      console.log("[DONE]");
      getLoading.value = false;
      newConv.loading = false;

      let dt = {
        input: newConv.content,
        parent_id: data2.parentId,
        topic_id: topicID.value,
        session_id: myUuid.value,
        content_type: 2,
      };
      // console.log(dt)
      let resData = await saveData(dt);
      newConv.idx = resData.data.dialogue_id;
      const node1: any = conversation.value.find((node: any) => node.idx === data2.parentId);
      const node2: any = tempConv.value.find((node: any) => node.idx === data2.parentId);
      const pIndex1 = node1.children.findIndex((item: any) => item === -1);
      const pIndex2 = node2.children.findIndex((item: any) => item === -1);
      // console.log(node1)
      // console.log(pIndex1)
      // console.log(node2)
      // console.log(pIndex2)
      node1.children[pIndex1] = resData.data.dialogue_id;
      node2.children[pIndex2] = resData.data.dialogue_id;
    }
    // if (streamDone) {
    //   done = true;
    // }
  }

  // if (topicID.value == 0) {
  //   triggerRefresh();
  // }
  getLoading.value = false;
  newConv = conversation.value[conversation.value.length - 1];
  newConv.loading = false;

  console.log(tempConv.value);

  localStorage.removeItem("jiugeConv");
  localStorage.setItem("jiugeConv", JSON.stringify(tempConv.value));
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

// 生成新分支，对服务端来说是新的对话
// type = 1  分支对话进入
// type = 2  重新生成进入
const forkData = async function (indexData: any, content: any, type: any) {
  // fork成功，infer单条
  // fork失败，infer全部作为旧的并暂停，infer新的单条
  //               |
  // fork成功，infer单条
  // fork失败，infer全部
  console.log(indexData);
  console.log(type);
  if (type == 1) {
    getInfer(null, 0, 3);
  } else {
    getInfer(null, 0, 4);
  }
  // try {
  //   // 'Authorization': `Bearer ${JIUGETOKEN}`  // 使用 Bearer 方式添加令牌
  //   // `${jiugeApiBaseUrl.value}/fork`
  //   "/jiugeApi/fork"
  //   const res = await axios.post(`${jiugeApiBaseUrl.value}/fork`, indexData, {
  //     headers: {
  //       Authorization: `Bearer ${JIUGETOKEN}`, // 使用 Bearer 方案添加令牌
  //     },
  //     timeout: 4000, // 设置超时时间为 5000 毫秒（4 秒）
  //   });
  //   console.log(res);
  //   if (res.status == 200) {
  //     console.log(conversation.value.length);
  //     getInfer(content, conversation.value.length - 2, type);
  //   }
  //   // getLoading.value = true;
  //   // let inputs = [{ role: "user", content: editText.value }];
  //   // console.log();
  //   //   let data2 = conversation.value[conversation.value.length - 1];
  //   //   controller.value = new AbortController();  // 只创建一次
  //   //   axiosOperate(inputs, data2)
  // } catch (e: any) {
  //   console.log("Error in forkData:", e);
  //   const errorData = e.response;
  //   console.log(errorData);
  //   if (e.response.status === 404) {
  //     console.log(errorData);
  //     if (errorData.data.status === 404) {
  //       console.log("fork时发现历史信息丢失，等待上传！");
  //       // await uploadHistoryFork();
  //       // 会话丢失，直接开启新对话，把两次infer变成一次
  //       if (type == 1) {
  //         getInfer(null, 0, 3);
  //       } else {
  //         getInfer(null, 0, 4);
  //       }
  //     } else if (errorData.data.startsWith("Sorry, Page Not Found")) {
  //       console.log("Sorry, Page Not Found");
  //       // forkData(indexData, content, type);
  //       // getLoading.value = false;
  //       if (type == 1) {
  //         getInfer(null, 0, 3);
  //       } else {
  //         getInfer(null, 0, 4);
  //       }
  //       // inputState.value = false;
  //     } else {
  //       console.log("getLoading.value = false; 4 ");
  //       getLoading.value = false;
  //     }
  //   } else if (e.response.status === 406) {
  //     if (errorData.status === 406) {
  //       ElMessage({
  //         message: "该会话正在推理中，不可重复进入推理服务，请稍后重试！",
  //         type: "warning",
  //       });
  //     }
  //   } else if (e.response.status === 409) {
  //     if (errorData.status === 409) {
  //     }
  //   } else if (e.response.status === 400) {
  //     if (errorData.status === 400) {
  //     }
  //   } else if (e.response.status === 416) {
  //     if (errorData.status === 416) {
  //     }
  //   } else if (e.response.status === 500 || e.response.status === 502 || e.code === "ECONNABORTED") {
  //     if (e.code === "ECONNABORTED") {
  //       console.error("Request timed out");
  //       ElMessage({
  //         message: "服务器连接超时，请及时联系系统管理员！",
  //         type: "warning",
  //       });
  //     } else {
  //       ElMessage({
  //         message: "服务器连接失败，请及时联系系统管理员！",
  //         type: "warning",
  //       });
  //     }

  //     // 只有在服务器500的时候才会在fork的时候主动添加对话错误的信息
  //     let data2 = {
  //       speaker: "assistant",
  //       content: "",
  //       loading: true,
  //       idx: -1,
  //       isEdit: false, //重新编辑
  //       session_id: myUuid.value,
  //       parentId: conversation.value[conversation.value.length - 1].idx, // parentid就是之前的最后一条
  //       children: [],
  //       currentPage: -1,
  //     };
  //     await conversationAddItem(data2);

  //     await handleError(e, data2);

  //     throw new Error(`HTTP error! status: ${e.response.status}`);
  //   } else {
  //     console.log("getLoading.value = false; 5 ");
  //     getLoading.value = false;

  //     throw new Error(`HTTP error! status: ${e.response.status}`);
  //     //       if (e.response.status === 401) {

  //     // }
  //   }
  //   throw e;
  //   console.log("Error in forkData", e);
  // }
};

const uploadHistory = async function () {
  console.log("历史信息丢失，等待上传！");
  console.log(conversation.value);

  let inputs: any = [];
  conversation.value.forEach((item: any, index: any) => {
    console.log();
    if (item.speaker == "none" || item.content == "") {
    } else {
      inputs.push({ role: item.speaker, content: item.content });
    }
  });
  console.log(inputs);

  // 创建 AbortController 实例
  controller.value = new AbortController();
  console.log(myUuid.value);
  let data2 = conversation.value[conversation.value.length - 1];

  console.log(data2);
  axiosOperate(inputs, data2);
};

const axiosOperate = async function (inputs: any, data2: any) {
  console.log(inputs);
  console.log(data2);
  try {
    const response = await fetchRequest(inputs, 0);
    await responseProcess(response, data2);
  } catch (error: any) {
    handleError(error, data2);
  }
};

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
      // if (infostring && infostring == "html") {
      //   console.log("encodeURIComponent");
      //   codeHtml = encodeURIComponent(code);
      // }
      if (infostring.trim() === "") {
        infostring = "bash"; // 默认语言设置为 bash
      }
      // 检查并替换不支持的语言
      if (infostring === "vue") {
        infostring = "javascript";
      }
      // 仅当 infostring 存在时进行代码高亮
      if (infostring) {
        codeHtml = hljs.highlight(infostring, code).value;
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
    console.log("===========not allow auto scrollToBottom=============");
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
  const container = scrollArea.value?.$el.querySelector(".el-scrollbar__wrap");
  if (!container) return;
  // 计算距离底部的距离
  const distanceToBottom = container.scrollHeight - (container.scrollTop + container.clientHeight);
  // console.log(distanceToBottom)
  // 如果距离底部的距离小于或等于10px，则认为是自动滚动状态
  isAutoScrollEnabled.value = distanceToBottom <= 10;
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
    await forkData(indexData, parentNode.content, 2);
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
};

const beforeUnloadHandler = function (e: any) {
  if (getLoading.value) {
    abortRequest(1);
  }
};

const initTemp = function () {
  console.log(conversation.value);
  console.log(tempConv.value);
  // tempConv.value = JSON.parse(JSON.stringify(conversation.value));
  showDialogueList();
};

const clearChat = function () {
  localStorage.removeItem("jiugeConv");
  conversation.value = JSON.parse(JSON.stringify(initConversation.value));
  console.log(conversation.value);
  tempConv.value = [];
  window.location.reload();
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
  let ccc: any = localStorage.getItem("jiugeConv");
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
    console.log("change conversation");
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

<style scoped></style>

<style>
.aichat-main {
  width: calc(100% - 40px);
  height: calc(100% - 40px);
  /* width: 100%; */
  /* border: 1px solid rgba(0, 0, 0, 0); */
  /* background: rgba(151, 190, 249, 0.11); */
  background: rgb(240 244 250);
  display: flex;
  padding: 20px;
  border-radius: 20px;
  position: relative;
}

.shuoming-btn {
  padding: 6px 8px;
}
.shuoming-btn2 {
  padding: 6px 6.8px;
}

.shuoming-item {
  padding: 12px 0 0 0;
}

.use-method {
  position: absolute;
  right: 35px;
  top: 30px;
  z-index: 1000;
}

.model-pick {
  position: absolute;
  left: calc(50%);
  transform: translateX(-50%);
  top: 30px;
  display: flex;
  justify-content: center;
  z-index: 10;
}

.dropdown-container {
  width: 100%;
  transition: width 0.5s ease-in-out, height 0.5s ease-in-out, margin-left 0.5s ease-in-out, margin-top 0.5s ease-in-out;
  /* background: #ccdaff; */
  background: #f6f6f6;
  border: 3px solid #8ad1fa;
  border-radius: 15px;
}

.expanded {
  width: 200px;
  height: 168px;
}

.dd-content {
  padding: 0 16px 0 16px;
  transition: height 0.3s ease-in-out;
}

.dd-header {
  height: 34px;
  color: #000;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.conf-btn {
  position: absolute;
  /* background: #b1e0fb; */
  margin-left: 6px;
  top: 2px;
}
.conf-btn-1 {
  position: absolute;
  background: #b1e0fb;
  top: 40px;
}

.slider-outer {
  display: flex;
}

.left-label {
  width: 140px;
  display: flex;
  justify-content: center;
  margin-right: 10px;
  line-height: 30px;
}

.resend-btn {
  height: 45px;
  padding: 10px 30px;
  border-radius: 18px;
  /* background: rgb(13, 13, 13); */
  background: rgb(5 96 178);
}

.resend-btn:hover {
  background-color: #4097f7;
}

.resend-text {
  color: #eee;
  font-size: 18px;
  margin-right: 10px;
  /* font-weight: bold; */
}

.warn-content {
  /* color: #ff0000; */
  /* font-weight: bold; */
  background: rgba(251, 220, 219, 1) !important;
  padding: 6px 10px 6px 8px !important;
}

.warn-outer {
  display: flex;
  background: rgba(251, 220, 219, 1) !important;
  border: 1px solid #ffa3a3;
}

.warn-icon {
  display: flex;
  align-items: center;
}

.conf-btn-2 {
  z-index: 100;
  margin-left: 0 !important;
  position: absolute;
  background: #b1e0fb;
  top: 80px;
}

.conf-btn-3 {
  z-index: 100;
  margin-left: 0 !important;
  position: absolute;
  background: #b1e0fb;
  top: 120px;
}

.el-dropdown-link {
  background: #48529a;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
  z-index: 2;
}

.stable-position {
  position: absolute;
  bottom: 145px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}

.edit-text {
  /* border: 1px solid #000; */
  resize: none;
  overflow-y: hidden;
  background: none;
}

.btn-tooltip {
  width: 36px;
  height: 25px;
}

.page-inner {
  font-size: 14px;
  width: 12px;
  text-align: center;
}

.grey-color {
  color: #a2a2a2;
}

.icon1 {
  width: 1.5em;
  height: 1.5em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.icon2 {
  width: 1.85em;
  height: 1.85em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.icon3 {
  width: 1.3em;
  height: 1.3em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.icon4 {
  width: 2.8em;
  height: 2.8em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.icon5 {
  width: 2.1em;
  height: 2.1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.icon6 {
  width: 0.8em;
  height: 0.8em;
  /* vertical-align: -0.15em; */
  fill: currentColor;
  overflow: hidden;
}

.icon7 {
  width: 0.66em;
  height: 0.66em;
  /* vertical-align: -0.15em; */
  fill: currentColor;
  overflow: hidden;
}

.icon8 {
  width: 1.6em;
  height: 1.6em;
  /* vertical-align: -0.15em; */
  fill: currentColor;
  overflow: hidden;
}

.left-menu {
  width: calc(20% - 20px);
  height: calc(100% - 20px);
  /* background-color: #EBECF0; */
  background: #f8f9fb;
  border-radius: 20px 0 0 20px;
  padding: 10px 10px;
}

.new-talk {
  margin-left: 20%;
  width: 60%;
  height: 38px;
  line-height: 38px;
  display: flex;
  justify-content: center;
  box-shadow: -5px -5px 10px #fff, 5px 5px 10px #babecc;
  border-radius: 10px;
  cursor: pointer;
}

.new-talk-inner {
  margin-left: 6px;
}

.new-talk:hover {
  box-shadow: -2px -2px 5px #fff, 2px 2px 5px #babecc;
}

.svg-icon {
  /* 通过设置 font-size 来改变图标大小 */
  width: 2.4em;
  /* 图标和文字相邻时，垂直对齐 */
  vertical-align: -0.15em;
  /* 通过设置 color 来改变 SVG 的颜色/fill */
  fill: currentColor;
  /* path 和 stroke 溢出 viewBox 部分在 IE 下会显示
      normalize.css 中也包含这行 */
  overflow: hidden;
}

.chat-class {
  width: calc(100%);
  height: calc(100% - 50px);
  background: #ffffff;
  box-shadow: 0px 3px 17px 1px rgba(149, 159, 193, 0.16);
  border-radius: 24px;
  /* padding: 30px 100px 20px 100px; */
  padding: 30px 20px 20px 20px;
  display: flex;
}

.all-content {
  padding: 0 90px;
}

.header-r {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 65%;
  /* height: 20%; */
  height: 15vw;
  background: url("/src/assets/image/user_ai/smooth.png");
  background-size: 100% 100%;
}

.bottom-item {
  min-height: 116px;
  position: absolute;
  left: calc(50%);
  transform: translateX(-50%);
  bottom: 40px;
  width: calc(80% - 240px);
  /* backdrop-filter: blur(20px); */
  padding: 0 70px;
  background: #ffffff;
}

.input-position {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}

.ipt {
  display: flex;
  justify-content: center;
  align-items: center;

  margin: 0 15px;
  padding: 8px 5px 8px 10px;
  border-radius: 10px;
  width: calc(100% - 200px);
  /* height: 50px; */
  border: 1px solid #e7eaec;
  box-shadow: 0 0 transparent, 0 0 transparent, 0 0 transparent, 0 0 transparent, 0 0 10px rgba(0, 0, 0, 0.1);
}

.file-position {
  width: calc(100% - 240px);
  padding-left: 100px;
  height: 42px;
}

.h-inner,
.ai-inner {
  display: flex;
  line-height: 1.5em;
  padding: 10px 0 20px 0;
}

.h-inner {
  justify-content: flex-end;
  /* human 消息靠右 */
}

.h-inner {
  justify-content: flex-end;
  /* human 消息靠右 */
}

.hm-img {
  height: 50px;
  width: 50px;
  margin-left: 30px;
}

.ai-img {
  height: 45px;
  width: 45px;
  margin-right: 30px;
}

.ai-c1 {
  max-width: calc(120%);
}

.ai-c2 {
  background: #f3f4f9;
  border-radius: 7px 21px 21px 21px;
  padding: 5px 10px 6px 10px;
  /* padding: 10px 20px 12px 20px; */
}

.send-img {
  height: 32px;
  width: 32px;
}

.h-c3-out {
  margin-top: 4px;
  height: 30px;
}

.h-c1 .edit-btn-out {
  display: none;
}

.h-c1:hover .edit-btn-out {
  display: flex;
}

.h-content .h-c3 {
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.h-c3-edit {
  height: 30px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.h-c1-all {
  width: 100%;
  /* background: #f3f4f9;
  border-radius: 21px 7px 21px 21px;
  padding: 8px 20px; */
  /* display: flex;
  align-items: center; */
}

.c2 {
  background: #f3f4f9;
  border-radius: 21px 7px 21px 21px;
  padding: 10px 20px;
  line-height: 24px;
  /* height: 24px; */
  text-align: left;
}

.h-c1-all .c2 {
  background: #f3f4f9;
  border-radius: 21px 7px 21px 21px;
  padding: 8px 20px;
  line-height: 24px;
  /* height: 24px; */
  text-align: left;
  border: 2px solid #cbcbcb;
}

/* .c2-all {
  background: #f3f4f9;
  border-radius: 21px 7px 21px 21px;
  padding: 8px 20px;
  line-height: 24px;
  text-align: left;
} */

.human {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  /* human 消息靠右 */
}

.h-content {
  width: 60%;
}

.ai {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  /* ai 消息靠左 */
}

.ai-content {
  width: 80%;
}

.ai-c3-out {
  height: 30px;
}

.ai-c3 {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-c3-btn {
  display: flex;
  align-items: center;
}

/* .ai-content:hover .ai-c3-btn {
  height: 30px;
  display: flex;
  align-items: center;
} */

.last-item-ai .ai-c3-btn {
  height: 30px;
  display: flex;
  /* justify-content: space-between; */
  align-items: center;
}

textarea {
  resize: none;
  overflow-y: auto;
  border: none;
  box-shadow: none;
  width: calc(100%);
  /* height: 34px; */
  max-height: 96px;
  line-height: 32px;
  font-size: 18px;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  /* padding-right: 10px; */
  padding: 0;
}

textarea:focus {
  outline: none;
  /* border-color: none;
  background-color: none; */
}

.start-prompt {
  margin: 12px 0 6px 0;
  background: #ffffff;
  border-radius: 8px;
  padding: 8px 6px;
}

.prompt-style {
  line-height: 30px;
  display: flex;
  align-items: center;
}

.ai-title {
  color: rgba(58, 58, 58, 1);
  font-weight: bold;
  padding: 4px 0;
}

.right-icon {
  color: rgba(72, 82, 154, 1);
  margin: 0 4px 0 0;
}

.btn-outer {
  display: flex;
  align-items: end;
  /* min-height: 41px; */
}

.click-pic {
  width: 40px;
  height: 40px;
  margin: 0 10px 0 10px;
  /* background: url("/src/assets/image/admin_ai/picture.png");
  background-size: 100% 100%; */
  display: flex;
  align-items: center;
  cursor: pointer;
}

.click-btn {
  width: 40px;
  height: 40px;
  margin: 0 20px;
  background: #132eed;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  /* background: url("/src/assets/image/admin_ai/send.png");
  background-size: 100% 100%; */
}

.not-allow-send {
  background: #cecfd7;
}

.empty {
  height: 10px;
  /* height: 190px; */
  width: 100%;
  flex-shrink: 0;
}

::-webkit-scrollbar {
  height: 1rem;
  width: 0.5rem;
}

::-webkit-scrollbar-thumb {
  background: transparent;
}

@media only screen and (min-width: 1921px) {
  .aichat-main {
  }

  .new-talk {
    height: 44px;
    line-height: 44px;
  }

  .left-menu {
    width: calc(20% - 10px);
    height: calc(100% - 30px);
    background: #f8f9fb;
    border-radius: 20px 0 0 20px;
    padding: 15px 5px;
  }

  .all-content {
    padding: 0 8%;
    font-size: 18px;
  }

  .dd-header {
    height: 40px;
    font-size: 20px;
  }

  .bottom-item {
    min-height: 116px;
    bottom: 40px;
    width: calc(64% - 20px);
    background: #ffffff;
    padding: 0 6%;
  }

  .ai-img {
    height: 50px;
    width: 50px;
    margin-right: 30px;
  }
}

@media only screen and (max-width: 1440px) {
  .c2 {
    background: #f3f4f9;
    border-radius: 21px 7px 21px 21px;
    padding: 4px 10px;
    line-height: 24px;
  }

  .dropdown-container {
    border: 2px solid #a6b9f7;
  }

  .expanded {
    width: 150px;
    height: 168px;
  }

  .dd-content {
    padding: 0 12px 0 12px;
    transition: height 0.3s ease-in-out;
  }

  .dd-header {
    height: 30px;
    font-size: 16px;
  }

  .aichat-main {
    padding: 12px;
    width: calc(100% - 24px);
    height: calc(100% - 24px);
  }

  .model-pick {
    top: 18px;
  }

  .header-r {
    top: 12px;
    right: 18px;
  }
  .icon1 {
    width: 1.2em;
    height: 1.2em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }

  .icon2 {
    width: 1.5em;
    height: 1.5em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }

  .icon3 {
    width: 1.1em;
    height: 1.1 em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }

  .h-c3-out {
    /* margin-top: 4px; */
    height: 30px;
  }

  .h-content .h-c3 {
    height: 30px;
  }

  .icon4 {
    width: 2em;
    height: 2em;
  }

  .icon5 {
    width: 1.5em;
    height: 1.5em;
  }

  .left-menu {
    width: calc(20% - 10px);
    height: calc(100% - 30px);
    background: #f8f9fb;
    border-radius: 20px 0 0 20px;
    padding: 15px 5px;
  }

  .aichat-main {
    border-radius: 18px;
  }

  .chat-class {
    width: calc(100% - 24px);
    height: calc(100% - 28px);
    border-radius: 18px;
    padding: 16px 12px 12px 12px;
  }

  .all-content {
    padding: 0 90px 0 80px;
    font-size: 14px;
  }

  .start-prompt {
    margin: 6px 0 3px 0;
    background: #ffffff;
    border-radius: 8px;
    padding: 6px;
  }

  .prompt-style {
    line-height: 24px;
  }

  .ai-c2 {
    background: #f3f4f9;
    border-radius: 7px 16px 16px 16px;
    padding: 3px 8px 4px 8px;
  }

  .ai-inner {
    line-height: 1.2em;
    padding: 6px 0 12px 0;
  }

  .hm-img {
    height: 40px;
    width: 40px;
    margin-left: 20px;
  }

  .ai-img {
    height: 35px;
    width: 35px;
    margin-right: 20px;
  }

  .send-img {
    height: 26px;
    width: 26px;
  }

  .ipt {
    margin: 0 10px;
    padding: 4px 5px 4px 10px;
    border-radius: 10px;
    width: calc(100% - 160px);
  }

  .input-position {
    margin-bottom: 0px;
  }

  textarea {
    width: calc(100%);
    max-height: 84px;
    line-height: 20px;
    font-size: 14px;
  }

  .bottom-item {
    min-height: 104px;
    bottom: 20px;
    width: calc(64% - 20px);
    background: #ffffff;
    padding: 0 4%;
  }

  .click-btn {
    width: 24px;
    height: 24px;
    margin: 0 10px 4px 20px;
    /* background: #48529a; */
    border-radius: 10px;
  }

  .empty {
    height: 10px;
    /* height: 150px; */
    width: 100%;
    flex-shrink: 0;
  }

  .h-c1 {
    border-radius: 16px 7px 16px 16px;
    padding: 4px 10px;
  }
}

/* 移动端 */
@media only screen and (max-width: 1200px) {
  .header-r {
    /* height: 15vw; */
  }
}

@media only screen and (min-width: 1441px) and (max-width: 1920px) {
  .new-talk {
    height: 36px;
    line-height: 36px;
  }

  .ipt {
    margin: 0 15px;
    padding: 4px 5px 4px 10px;
    border-radius: 10px;
    width: calc(100% - 200px);
  }

  .resend-btn {
    height: 42px;
    padding: 10px 28px;
    border-radius: 16px;
  }

  .click-btn {
    margin: 0 10px 0 30px;
  }

  .resend-text {
    font-size: 16px;
    margin-right: 8px;
  }

  .shuoming-btn {
    padding: 4px 6px;
  }
  .shuoming-btn2 {
    padding: 4px 4.8px;
  }
}

@media only screen and (max-width: 1440px) {
  .aichat-main {
    /* width: calc(100% - 42px); */
  }

  .resend-btn {
    height: 36px;
    padding: 8px 18px;
    border-radius: 16px;
  }

  .resend-text {
    font-size: 14px;
    margin-right: 6px;
  }

  .shuoming-btn {
    padding: 2px 6px;
    font-size: 12px;
  }
  .shuoming-btn2 {
    padding: 2px 4.8px;
    font-size: 12px;
  }
}

.dd-content .el-slider {
  padding: 0 0 8px 0;
}

.dd-content .el-slider__marks-text {
  color: rgb(2 62 255);
  margin-top: 8px;
}

.dd-content .el-slider__button {
  height: 12px;
  width: 12px;
}

.ai-c3 .el-button.is-link:not(.is-disabled):hover {
  background: #dfdddd;
  color: #2b36ff;
}

.edit-btn-out .el-button.is-link:not(.is-disabled):hover {
  background: #dfdddd;
  color: #2b36ff;
}

.ai-c3 .btn-tooltip,
.edit-btn-out .el-button.is-link {
  height: 30px;
  width: 30px;
}

.h-c1 .el-textarea__inner {
  resize: none;
}

/* 特定页面的样式重置 */
.no-reset * {
  margin: revert;
  padding: revert;
}

.aichat-main p {
  margin: 6px 0;
}

.aichat-main .bg-white {
  background-color: rgba(255, 255, 255, 1);
  border-radius: 0.375rem;
  margin: 10px 0;
}

.aichat-main .text-gray-200 {
  /* color: rgba(217, 217, 227, 1); */
  color: rgb(54 54 54);
}

.aichat-main .py-2 {
  padding-bottom: 0.5rem;
  padding-top: 0.5rem;
}

.aichat-main .px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.aichat-main .bg-gray-800 {
  /* background-color: rgba(52, 53, 65, 1); */
  background-color: rgb(236 236 236);
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
  justify-content: space-between;
  align-items: center;
}

.aichat-main .p-4 {
  padding: 0.8rem 1rem;
  background: #fff;
  border-bottom-left-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
}

.aichat-main .overflow-y-auto {
  overflow-y: auto;
}

.aichat-main .code_header {
  font-size: 0.75rem;
  line-height: 1rem;
}

/* .aichat-main code {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  font-size: 16px;
} */

.aichat-main code,
.aichat-main kbd,
.aichat-main samp,
.aichat-main pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 1em;
}

.aichat-main code.hljs {
  /* color: #6c6c6c; */
}

.aichat-main code.hljs {
  padding: 0;
}

.aichat-main .whitespace-pre {
  white-space: pre !important;
}

.aichat-main .copy-btn {
  padding: 0;
  gap: 0.5rem;
  display: flex;
  margin-left: 0;
  float: right;
  background-color: transparent;
  /* color: rgb(217, 217, 227); */
  color: rgb(54 54 54);
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.25s;
}

.aichat-main .copy-btn:hover {
  border-color: transparent;
}

.aichat-main .copy-btn:focus {
  outline: 0;
}

.aichat-main .copy-btn:focus-visible {
  outline: 0;
}

.aichat-main a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}

.aichat-main ol {
  padding-inline-start: 20px;
}

.aichat-main ul {
  /* display: block;
    list-style-type: disc;
    margin-block-start: 1em;
    margin-block-end: 1em;
    margin-inline-start: 0px;
    margin-inline-end: 0px; */
  padding-inline-start: 20px;
}

@media only screen and (min-width: 1441px) and (max-width: 1920px) {
}

@media only screen and (max-width: 1440px) {
  .aichat-main p {
    margin: 3px 0;
  }

  .aichat-main .p-4 {
    padding: 0.6rem;
  }

  .aichat-main ol {
    padding-inline-start: 15px;
  }

  .aichat-main .bg-white {
    margin: 6px 0;
  }
}

.edit-text .el-textarea__inner {
  resize: none;
  /* 针对 el-textarea 组件内部的 textarea 元素 */
}

.edit-text .el-textarea__inner {
  border: none;
  box-shadow: none;
  background-color: transparent;
}

.scroll-area .el-scrollbar__wrap {
  scroll-padding-bottom: 12px;
  /* 在滚动容器底部留出10px的空间 */
}

.small-textarea {
}

.medium-textarea .el-textarea__inner {
  font-size: 16px;
}

.large-textarea .el-textarea__inner {
  font-size: 18px;
  line-height: 2;
}

.edit-text .el-textarea__inner:hover,
.edit-text .el-textarea__inner:focus {
  box-shadow: none;
}

/* 为了跨浏览器兼容性，设置webkit前缀 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
  /* 设置滚动条的宽度 */
  height: 8px;
  /* 设置滚动条的高度 */
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  /* 滚动条轨道的背景颜色 */
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
  /* 滚动条实际可拖动部分的颜色 */
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
  /* 鼠标悬浮时滚动条的颜色 */
}

.c2 table {
  margin: 12px 0;
  width: 100%;
  border-spacing: 0 0;
  /* border: 1.4px solid #d5d5d7; */
  padding: 1%;
}

.c2 th {
  background-color: hsla(0, 0%, 93%, 0.2);
  border-bottom: 1px solid #646cff;
  border-left: 1px solid #646cff;
  border-top: 1px solid #646cff;
  padding: 0.25rem 0.75rem;
}

.c2 th:first-child {
  border-top-left-radius: 0.375rem;
}

.c2 th:last-child {
  border-right: 1px solid #646cff;
  border-top-right-radius: 0.375rem;
}

.c2 td {
  border-bottom: 1px solid #646cff;
  border-left: 1px solid #646cff;
  /* border: 1px solid #646cff; */
  padding: 0.15rem 0.45rem;
}

.c2 td:last-child {
  border-right: 1px solid #646cff;
}

.c2 tbody tr:last-child td:first-child {
  border-bottom-left-radius: 0.375rem;
}

.c2 tbody tr:last-child td:last-child {
  border-bottom-right-radius: 0.375rem;
}

.bottom-item .el-message {
  position: absolute;
  /* top: -10px; */
}

/* .scroll-area .el-scrollbar__view{
  min-height: 100%;
} */

button:focus,
button:focus-visible {
  outline: none;
}

.result-streaming > :not(ol):not(ul):not(pre):last-child:after,
.result-streaming > ol:last-child li:last-child:after,
.result-streaming > ul:last-child li:last-child:after {
  -webkit-animation: blink 1s steps(5, start) infinite;
  animation: blink 1s steps(5, start) infinite;
  content: "▋";
  margin-left: 0.25rem;
  vertical-align: baseline;
  font-family: "宋体";
}

@keyframes blink {
  to {
    visibility: hidden;
  }
}
</style>
