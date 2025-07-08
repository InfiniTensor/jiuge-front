<template>
  <div class="h-chat-main">
    <div style="margin-top: 10px; display: flex; justify-content: center;">
      <div class="new-talk" @click="startNewTalk">
        <svg class="icon svg-icon-top" aria-hidden="true">
          <use xlink:href="#icon-duihua"></use>
        </svg>
        <span class="new-talk-inner">新对话</span>
      </div>
    </div>

    <div class="l-content">
      <el-scrollbar>
        <div
          v-for="(item, index) in historyTalkList"
          :key="item.topic_id"
          class="chat-item"
          @click="selectMenuItem(item, index, 1)"
          ref="menuItems"
          :class="{
            hover: hoverItem === index || clickHover === index,
            active: selectedMenuItemIndex === index,
          }"
          @mouseover="hoverItem = index"
          @mouseout="hoverItem = null"
        >
          <div class="uptoshow">
            <div style="padding: 2px 0 0 8px" v-if="!item.editable">
              <svg class="icon svg-icon" aria-hidden="true" v-if="selectedMenuItemIndex === index">
                <use xlink:href="#icon-duihua3"></use>
              </svg>
              <el-image :src="unchat" class="unchat-img" v-else></el-image>
            </div>
            <div class="text" v-if="!item.editable">
              <template v-if="index == 0">
                <span v-if="index == 0 && !sgl">{{ item.topic_name }}</span>
                <span ref="texts" id="type-target" class="msg" v-if="index == 0 && sgl"></span>
              </template>
              <template v-else>
                <span>{{ item.topic_name }}</span>
              </template>
            </div>
            <div ref="editPlace" class="edit-input" v-else @click.stop="">
              <el-input v-model="editCopyItem.topic_name" @keyup.enter="confirmName(item)" :size="size" @blur="cancelEdit(item)"></el-input>
            </div>
            <div class="gradient-bg" v-if="!item.editable"></div>
            <div class="hover-item" v-if="!item.editable">
              <el-button link @click.stop="updateName(item)" style="margin-right: 2px">
                <svg class="" aria-hidden="true" :class="dynamicIcon">
                  <use xlink:href="#icon-bianji1"></use>
                </svg>
              </el-button>

              <el-button link style="margin-left: 0" @click.stop="continueHover(index, item)">
                <svg class="" aria-hidden="true" :class="dynamicIcon">
                  <use xlink:href="#icon-shanchu2"></use>
                </svg>
              </el-button>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts" name="HistoryChat">
import TypeIt from "typeit";
import { Delete, EditPen, WarningFilled } from "@element-plus/icons-vue";
import { getAssetsFile } from "@/utils/tools.js";
import { DynamicSizeGrid, ElMessage, ElMessageBox } from "element-plus";
import axios from "axios";
import { cloneDeep } from "lodash";

import { storeToRefs } from "pinia";
import { useJiuyuan } from "@/store";

const jiuyuan = useJiuyuan();
const { topicList } = storeToRefs(jiuyuan);

const props = defineProps(["refreshSignal"]);

const size = ref("large");
const resizeFlag = function () {
  if (window.innerWidth > 1920) {
    size.value = "large";
  } else if (window.innerWidth > 1440 && window.innerWidth <= 1920) {
    size.value = "default";
  } else {
    size.value = "small";
  }
};

const dynamicIcon = computed(() => {
  if (window.innerWidth > 1920) {
    return "icon1";
  } else if (window.innerWidth > 1440 && window.innerWidth <= 1920) {
    return "icon1";
  } else {
    return "icon4";
  }
});

const dynamicIcon2 = computed(() => {
  if (window.innerWidth > 1920) {
    return "icon2";
  } else if (window.innerWidth > 1440 && window.innerWidth <= 1920) {
    return "icon2";
  } else {
    return "icon5";
  }
});

// 不管是确认还是取消，都同时取消hover效果
const clickHover = ref(-1);

const cancelEvent = () => {
  console.log("cancel!");
  clickHover.value = -1;
};
// 点击按钮 持续hover效果
const continueHover = async (index: any, item: any) => {
  clickHover.value = index;
  ElMessageBox.confirm("确认删除话题吗", "Warning", {
    type: "warning",
    icon: markRaw(WarningFilled),
    center: true,
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    customClass: "topicMsgBox",
  })
    .then(() => {
      deleteTopic(item);
      clickHover.value = -1;
    })
    .catch(() => {
      cancelEvent();
    });
};

const cancelHover = () => {
  hoverItem.value = null;
};

// 点击外部监听
const editPlace = ref();

const unchat = getAssetsFile("image/chat.png");
// 选择的项 和 悬停的项
const selectedMenuItemIndex = ref(-1);
const hoverItem = ref();
var menuList = ref();
const menuItemsRefs = ref([]);

const overlayStyle = computed(() => {
  const selectedItemElement: HTMLElement = menuItemsRefs.value[selectedMenuItemIndex.value];
  if (selectedItemElement) {
    return {
      top: selectedItemElement.offsetTop + 8 + "px",
      left: selectedItemElement.offsetLeft + 8 + "px",
      width: selectedItemElement.offsetWidth - 16 + "px",
      height: selectedItemElement.offsetHeight - 2 + "px",
    };
  }
  return {};
});

let emit = defineEmits(["pickTopic", "newTalk", "getNewTopicId", "deleteNowTopic"]);
const pickItem = ref();
const selectMenuItem = (item: any, index: number, type: number) => {
  console.log(item);
  // 如果对象为空
  if (item) {
    selectedMenuItemIndex.value = index;
    // 锁定选择的项
    pickItem.value = item.topic_id;
    console.log(pickItem);
    if (type == 1) {
      emit("pickTopic", item);
    }
  } else {
    selectedMenuItemIndex.value = -1;
  }
};

let typeInstances = null;
const sgl = ref(false);
const startTyping = (index = 0) => {
  nextTick(() => {
    console.log(index);

    const target = document.getElementById(`type-target`);
    // @ts-ignore
    typeInstances = new TypeIt(target, {
      strings: [historyTalkList.value[index].topic_name],
      cursorChar: "|",
      speed: 100,
      lifeLike: true,
      afterComplete: function (instance) {
        console.log("xxxx");
        instance.destroy(); // Destroy the TypeIt instance
        typeInstances = null;
        sgl.value = false;
      },
    }).go();
  });
};

// 数组变化或者窗口大小变化触发computed更新
const handleResize = async function () {
  await nextTick();
  menuItemsRefs.value = Array.from(document.querySelectorAll(".chat-item"));
};

const historyTalkList = ref();
const getTopicList = async function (type: any) {
  try {
    let tmpList = cloneDeep(topicList.value);
    if (tmpList && tmpList.length > 0) {
      // 添加 编辑 属性
      historyTalkList.value = tmpList.map((item: any) => ({
        ...item,
        editable: false,
      }));
      handleResize();
      console.log(historyTalkList.value);
      console.log(selectedMenuItemIndex.value);
      if (type == 2) {
        console.log(selectedMenuItemIndex.value);
        if (selectedMenuItemIndex.value != -1) {
          const index = historyTalkList.value.findIndex((item: any) => item.topic_id == pickItem.value);
          console.log(pickItem.value);
          console.log(index);
          console.log("getTopicList");
          selectMenuItem(historyTalkList.value[index], index, 1);
        }
      }
    }
  } catch (error) {
    console.log("请求报错：", error);
    ElMessage.error("请求报错！");
  }
};

// 正在编辑的item
const editCopyItem = ref();
const editItem = ref();
const updateName = function (item: any) {
  // 深拷贝
  editCopyItem.value = JSON.parse(JSON.stringify(item));
  // 浅拷贝
  editItem.value = item;
  item.editable = true;
  document.addEventListener("click", checkClickOutside);
};

//失去焦点即不进行编辑
const cancelEdit = function (item: any) {
  item.editable = false;
  console.log(historyTalkList);
  document.removeEventListener("click", checkClickOutside);
};

const confirmName = async function (item: any) {
  console.log(item.topic_id);
  console.log(editCopyItem.value.topic_id);
  console.log(editCopyItem.value.topic_name);
  try {
    let data = cloneDeep(topicList.value);
    let topicItem = data.find(item => item.topic_id == item.topic_id);
    topicItem.topic_name = editCopyItem.value.topic_name
    item.topic_name = editCopyItem.value.topic_name;
    jiuyuan.setTopicList(data);

    cancelEdit(item);
    ElMessage.success("更新成功");
  } catch (error) {
    console.log("请求报错：", error);
  }
};

// 如果是当前选中的，则回到初始化，否则只删除当前项后仍然使用原来选中的话题
const deleteTopic = async function (item: any) {
  console.log(item);
  try {
    // let data = {
    //   topic_id: item.topic_id,
    // };
    let data = cloneDeep(topicList.value);
    console.log(data)
    let topicIndex = data.findIndex(dataItem => dataItem.topic_id == item.topic_id);
    console.log(topicIndex)
    data.splice(topicIndex, 1);
    console.log(data)
    jiuyuan.setTopicList(data);
    if (item.topic_id == pickItem.value) {
      if(data.length == 0){
        startNewTalk();
      }else{
        pickItem.value = data[0].topic_id;
      }
      emit("deleteNowTopic");
    }
    getTopicList(2);
 
  } catch (error) {
    console.log("请求报错：", error);
  }
};

// 开启新对话
const startNewTalk = function () {
  selectedMenuItemIndex.value = -1;
  emit("newTalk");
};

const checkClickOutside = async (event: any) => {
  // await nextTick();
  console.log(event.target);
  console.log(editPlace.value[0]);
  // 同一时间只有一个edit被激活
  if (editPlace.value && event.target && !editPlace.value[0].contains(event.target)) {
    console.log("cancelEdit");
    cancelEdit(editItem.value);
  }
};

const newToUpdate = async function () {
  try {
    let tmpList = cloneDeep(topicList.value);
    sgl.value = true;
    // 添加 编辑 属性
    historyTalkList.value = tmpList.map((item: any) => ({
      ...item,
      editable: false,
    }));
    console.log(topicList.value)
    console.log(historyTalkList.value)
    handleResize();
    // 如果是新话题，默认选中第0项
    const index = 0;
    console.log("newToUpdate");

    selectMenuItem(historyTalkList.value[index], index, 2);

    startTyping();
    // topic_id
    emit("getNewTopicId", historyTalkList.value[index].topic_id);
  } catch (error) {
    console.log("请求报错：", error);
  }
};

const ins = ref();

onMounted(async () => {
  await getTopicList(1);
  console.log(selectedMenuItemIndex.value);
  await newToUpdate();
  window.addEventListener("resize", handleResize);

  resizeFlag();
  window.addEventListener("resize", resizeFlag);
});

// 组件退出前移除监听
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("resize", resizeFlag);
  document.removeEventListener("click", checkClickOutside);
});

watch(menuList, () => {
  handleResize();
});

// 使用 watch 来响应 refreshSignal 的变化
watch([() => props.refreshSignal], () => {
  console.log("update");
  newToUpdate();
});
</script>

<style lang="scss" scoped>
.h-chat-main {
  height: 100%;
}

.icon1 {
  width: 1.4em;
  height: 1.4em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.icon4 {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.icon2 {
  width: 2em;
  height: 2em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.icon5 {
  width: 1.6em;
  height: 1.6em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.edit-input {
  width: 80%;
  padding: 0 10%;
}

.l-content {
  position: relative;
  padding-top: 20px;
  height: calc(100% - 70px);
}

.menu-overlay {
  position: absolute;
  transition: top 0.3s ease;
  background-color: #e6eef9;
  border-radius: 8px;
}

.chat-item {
  padding: 2px 10px;
  cursor: pointer;
  font-size: 16px;
  height: 50px;
}

.chat-item .text {
  width: calc(100% - 60px);
  display: inline;
  margin-left: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  // flex-grow: 1;
}

.chat-item.hover .text {
  color: #409eff;
}

.chat-item.active .text {
  color: #409eff;
  font-weight: 600;
}

.uptoshow {
  position: relative;
  z-index: 2;
  margin: 8px 0px;
  display: flex;
  align-items: center;
  font-size: 18px;
  height: 100%;
  border-radius: 8px;
}

.chat-item.active .uptoshow {
  background-color: #e6eef9;
}

.chat-item.hover .uptoshow {
  background: #e6eef9;
}

.hover .hover-item,
.active .hover-item {
  display: flex;
}

.hover-item {
  position: absolute;
  display: none;
  right: 4px;
  bottom: 12px;
  transition: visibility 0s linear;
}

.delete-icon {
  width: 1.5em;
  height: 1.5em;
  color: #4b4b4b;
}

.unchat-img {
  width: 1.5em;
  height: 1.5em;
}

.svg-icon {
  width: 1.5em;
  height: 1.5em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

/* 默认情况下，渐变背景不可见 */
.gradient-bg {
  background: linear-gradient(to left, #e6eef9 50%, hsla(0, 0%, 100%, 0) 70%);
  opacity: 0;
  // transition: opacity 0.3s ease;
  position: absolute;
  right: 22px;
  height: 30px;
  width: 50%;
  transition: opacity 0s linear;
}

/* hover 状态 */
.hover .gradient-bg,
.active .gradient-bg {
  opacity: 1;
}

.new-talk {
  width: calc(100% - 20px);
  height: 44px;
  line-height: 44px;
  display: flex;
  justify-content: center;
  box-shadow: -2px -2px 5px #f5f5f5, 2px 2px 5px #babecc;
  border-radius: 10px;
  // background: #eee;
  border: 1px;
  cursor: pointer;
}

.new-talk-inner {
  margin-left: 6px;
  font-size: 18px;
}

.new-talk:hover {
  box-shadow: -1px -1px 4px #f5f5f5, 1px 1px 4px #babecc;
}

.svg-icon-top {
  width: 2.4em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

@media only screen and (min-width: 1441px) and (max-width: 1920px) {
  .uptoshow {
    margin: 6px 0px;
    font-size: 16px;
  }

  .hover-item {
    right: 4px;
    bottom: 8px;
  }

  .new-talk {
    width: calc(100% - 20px);
    height: 36px;
    line-height: 36px;
  }
  .chat-item {
    height: 40px;
  }

  .new-talk-inner {
    font-size: 16px;
  }
}

@media only screen and (max-width: 1440px) {
  .hover-item {
    right: 4px;
    bottom: 7px;
  }
  .chat-item {
    height: 36px;
  }

  .gradient-bg {
    background: linear-gradient(to left, #e6eef9 70%, hsla(0, 0%, 100%, 0) 90%);
    position: absolute;
    // top: 4px;
    right: 4px;
    height: 34px;
    width: 50%;
  }

  .chat-item .text {
    width: calc(100% - 40px);
    margin-left: 4px;
    // flex-grow: 1;
  }

  .uptoshow {
    margin: 4px 0px;
    font-size: 15px;
  }

  .new-talk {
    width: calc(100% - 20px);
    height: 32px;
    line-height: 34px;
    border-radius: 8px;
  }

  .new-talk-inner {
    font-size: 15px;
  }

  .svg-icon-top {
    width: 2.2em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }

  .new-talk-inne {
    margin-left: 4px;
    font-size: 16px;
  }
}
</style>

<style>
.hover-item .el-button.is-link {
  background: rgba(255, 255, 255, 0.75);
}

.hover-item .el-button.is-link:not(.is-disabled):hover {
  background: rgba(132, 220, 255, 0.75);
}

.topicMsgBox {
  max-width: 320px;
}
</style>
