<template>
  <!-- 答卷页面 -->
  <div class="survery-topic-page">
    <div class="topic-page-container">
      <div :class="['body-content', previewType === 'Phone' ? 'phone' : '']" ref="editorRef">
        <!-- 没有权限啥的 -->
        <div v-if="erroryText">
          <el-empty :description="erroryText" />
        </div>
        <!-- 有权限答题 -->
        <div class="topic-list comps" v-else>
          <el-watermark :font="{ fontSize: 20 }" :content="selectForm?.displayWaterMark ? selectForm?.waterMarkText || '' : ''">
            <div
              v-for="item in pageCompList"
              :key="item?.id"
              :class="{
                'cursor-move': true,
                'form-item': true
              }"
              @click="selectComp(item)"
            >
              <FormComponent
                v-if="!['paging'].includes(item.type) || (['paging'].includes(item.type) && formShowConfig.displayPaging)"
                :render-type="'preview'"
                :key="item.id + previewType"
                :component="item"
                :type="item.type"
                :is-dev="item?.isDev ?? false"
                :form-config="selectForm"
                :preview-type="previewType"
                :is-preview-render="true"
                :editor-scroll-info="editorScrollInfo"
              >
              </FormComponent>
            </div>
            <div
              class="form-footer form-item"
              :style="{
                'text-align': pageFooter.position || 'left'
              }"
            >
              <el-button
                class="submit"
                type="primary"
                :icon="pageFooter.buttonIconShowBool ? Check : null"
                :size="pageFooter.size"
                style="width: 120px"
                :style="{ padding: getSize(), lineHeight: getLineheight() }"
                @click="submitAnswerSheet"
              >
                {{ pageFooter.buttonText || "提交" }}
              </el-button>
            </div>
            <!-- 脚标 -->
            <SupportComp />
          </el-watermark>
        </div>
      </div>
    </div>
    <el-dialog v-model="dialogTableVisible" :close-on-click-modal="false" width="78%">
      <div class="popup-icon">
        <el-icon :size="80">
          <CircleCheck />
        </el-icon>
      </div>
      <div class="popup-text">{{ popupText }}</div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
type PreviewType = "Phone" | "PC";
import { ref, reactive, onMounted, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import { Check, CircleCheck } from "@element-plus/icons-vue";
import FormComponent from "../dynamicForm/components/componentsForm/index.vue";
import SupportComp from "../dynamicForm/preview/component/SupportComp.vue";
import { getSurveyTopicList, getSurveySetting, submitSurvey } from "@/api/modules/questionnaire/topicPage";
import { v4 as uuidv4 } from "uuid";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
import { regexRule, regexRuleMesg } from "../dynamicForm/components/compConfig";
import { ElMessage } from "element-plus";
import _ from "lodash";
const route = useRoute();
const dialogTableVisible = ref(false);
const popupText = ref("");
const rulesObj = reactive({
  submitPromptText: "",
  submitJumpUrl: ""
});
const formShowConfig = ref({
  formTitle: "表单预览",
  waterMarkBool: true,
  displayPaging: true
});
const pageCompList = ref<any[]>([]);
const erroryText = ref(""); // 错误提示文字
const selectForm = ref();
interface FooterType {
  id: string;
  size: string;
  buttonText: string;
  position: "left" | "right" | "center";
  buttonIconShowBool: boolean;
}
const pageFooter = ref<FooterType>({
  id: "",
  size: "large",
  position: "center",
  buttonText: "提交",
  buttonIconShowBool: true
}); // 底部

const previewType = ref<PreviewType>("Phone");
const compStore = useSelectCompStore();

const showRulesObj = reactive({});
const activeComp = ref({
  type: "component",
  id: ""
}); // 当前选中组件
const startTime = ref<number>(0); // 进入页面的时间戳

const getSize = () => {
  const data = pageFooter?.value;
  return data?.size == "large" ? "0 26px" : data?.size == "small" ? "0 10px" : "0 16px";
};

const getLineheight = () => {
  const data = pageFooter?.value;
  return data?.size == "large" ? "40px" : data?.size == "small" ? "24px" : "32px";
};
// 获得问卷题目
const initTopicList = async projectKey => {
  let response: any = await getSurveyTopicList(projectKey); // 获得问卷题目
  if (response.code == 200) {
    startTime.value = Date.now();
    let { projectItems = [] } = response.data;
    let hideenIdArr = [];
    let tempTopicArr = [];
    let displayRulesObj = {};
    projectItems.forEach(el => {
      if (el?.expand?.expresson) {
        displayRulesObj[el.formItemId] = {};
        el.expand.expresson.forEach(item => {
          hideenIdArr.push(item.formItemId);
          displayRulesObj[el.formItemId][item.optionValue] = item.formItemId;
        });
      }
      tempTopicArr.push(el.expand);
    });

    // 比如要设置显示规则
    Object.assign(showRulesObj, displayRulesObj);
    console.log("*********", showRulesObj);

    tempTopicArr.forEach(item => {
      if (hideenIdArr.includes(item.id)) {
        item.hideen = true;
      }
    });
    pageCompList.value = tempTopicArr;
    pageFooter.value = response.data.project.pageFooter;
    selectForm.value = response.data.project.selectForm;
  }
};
// 获得问卷设置
const setRulesObj = async projectKey => {
  try {
    let deviceId = localStorage.getItem("device_id");
    let response = await getSurveySetting({ projectKey, fingerprint: deviceId });
    if (response.code == 200) {
      Object.assign(rulesObj, response.data);
      initTopicList(projectKey);
    }
  } catch (error: any) {
    erroryText.value = error.msg;
  }
};
// 值改了看是否有逻辑关系导致的显示隐藏
const childrenCompValueChange = value => {
  if (!showRulesObj[value.id]) return false;
  let showArr = [];
  let hiddenArr = [];
  Object.keys(showRulesObj[value.id]).forEach(key => {
    if (Array.isArray(value.value)) {
      value.value.forEach(element => {
        if (element == key) {
          showArr.push(showRulesObj[value.id][key]);
        } else {
          hiddenArr.push(showRulesObj[value.id][key]);
        }
      });
    } else {
      if (key == value.value) {
        showArr.push(showRulesObj[value.id][key]);
      } else {
        hiddenArr.push(showRulesObj[value.id][key]);
      }
    }
  });
  pageCompList.value.forEach(el => {
    if (showArr.includes(el.id)) {
      el.hideen = false;
    } else if (hiddenArr.includes(el.id)) {
      el.hideen = true;
    } else {
      el.hideen = false;
    }
  });
};
watch(
  [() => compStore.compConfig, () => compStore.currentGlobalFormConfig],
  ([compConfig, currentGlobalFormConfig]) => {
    updateCompByChange({
      ...compConfig
    });
    // selectForm.value = currentGlobalFormConfig;
  },
  { deep: true }
);
// 先初步校验规则，如果适合再往后走,更新选中组件数据
const updateCompByChange = (compConfig: any) => {
  const index = getActiveCompIndex();
  if (index > -1 && pageCompList.value.length) {
    pageCompList.value[index] = { ...pageCompList.value[index], ...compConfig };
    childrenCompValueChange({ id: activeComp.value.id, value: compConfig.dataValue });
  }
};
const getActiveCompIndex = () => {
  return _.findIndex(pageCompList.value, (item: any) => item.id === activeComp.value.id);
};
// 组件选中
const selectComp = (item: any) => {
  compStore.initCurrentComp(item);
  activeComp.value.id = item.id;
};
const testNumber = (nowItem, phone: string) => {
  let str: any = phone;
  if (nowItem["formValidationFormat"] == "phone" || nowItem["formValidationFormat"] == "idCard") {
    str = Number(str);
  }
  const isValid = regexRule[nowItem["formValidationFormat"]].test(str);
  return isValid;
};
const submitAnswerSheet = () => {
  // 先校验是否是必填项，校验完看是填写是否错误
  let setRespans = getCheckoutList();
  let isNext = true;
  let hasErroyArr: any = [];
  for (let index = 0; index < setRespans.length; index++) {
    const element = setRespans[index];
    element.errorMsg = "";
    // 增加代码校验，如果有值是否符合校验规则的
    if (element.isRequired) {
      if (element.dataValue) {
        // 设置了校验类型的
        if (element["formValidationFormat"]) {
          isNext = testNumber(element, element.dataValue);
          hasErroyArr.push(isNext);
          if (!isNext) {
            let msg = regexRuleMesg[element["formValidationFormat"]];
            element.errorMsg = msg;
          }
        }
      } else {
        isNext = false;
        hasErroyArr.push(isNext);
        element.errorMsg = "此数据不能为空";
        if (element["customErrorMessage"]) {
          element.errorMsg = element["customErrorMessage"];
        }
      }
    } else {
      hasErroyArr.push(isNext);
    }
  }
  if (isAllTrue(hasErroyArr)) {
    console.log("///////", setRespans);
    const endTime = Date.now();
    const duration = Math.floor((endTime - startTime.value) / 1000); // 秒
    let obj = {
      projectKey: route.query?.projectKey,
      completeTime: duration,
      fingerprint: localStorage.getItem("device_id"),
      submitUa: getClientInfo(),
      submitOs: getOS(),
      submitBrowser: getBrowser(),
      answerList: setTopicList(setRespans)
    };
    submitFun(obj);
  }
};
const submitFun = async params => {
  console.log("============提交答案", params);
  let result = await submitSurvey(params);
  if (result.code == 200) {
    let resText = "答卷提交成功";
    if (rulesObj.submitPromptText) {
      resText = rulesObj.submitPromptText;
    }

    let jumpUrl = rulesObj?.submitJumpUrl;
    if (jumpUrl) {
      ElMessage.success(`${resText}`);
      setTimeout(() => {
        location.href = jumpUrl;
      }, 200);
    } else {
      dialogTableVisible.value = true;
      popupText.value = resText;
    }
  }
};

// 滚动
// 1. 定义滚动信息的 TypeScript 接口（类型安全）
interface ScrollInfo {
  scrollHeight: number; // 内容总高度
  clientHeight: number; // 可视区域高度
  scrollTop: number; // 已滚动距离
  isAtBottom: boolean; // 额外判断：是否滚动到底部（可选）
}
// 2. 获取 .body 元素的 DOM 引用（初始为 null）
const editorRef = ref<HTMLDivElement | null>(null);
// 3. 响应式变量存储滚动信息（初始值为 0）
const editorScrollInfo = reactive<ScrollInfo>({
  scrollHeight: 0,
  clientHeight: 0,
  scrollTop: 0,
  isAtBottom: false // 可选：用于快速判断是否到底部
});

/**
 * 更新元素的滚动信息
 */
const updateBodyScrollInfo = () => {
  const scrollContainer = editorRef.value;
  if (!scrollContainer) return;
  const { scrollHeight, clientHeight, scrollTop } = scrollContainer;
  editorScrollInfo.scrollHeight = scrollHeight;
  editorScrollInfo.clientHeight = clientHeight;
  editorScrollInfo.scrollTop = scrollTop;
  // 4. 可选：判断是否滚动到底部（留 1px 误差，避免精度问题）
  editorScrollInfo.isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
};

onMounted(async () => {
  const projectKey = route.query?.projectKey;
  previewType.value = getDeviceType();
  if (!localStorage.getItem("device_id")) {
    localStorage.setItem("device_id", uuidv4());
  }
  setRulesObj(projectKey);
  nextTick(() => {
    const scrollContainer = editorRef.value;
    if (!scrollContainer) return;
    // 2. 初始时主动更新一次滚动信息（获取初始状态）
    updateBodyScrollInfo();
    // 3. 绑定 scroll 事件：滚动时实时更新
    scrollContainer.addEventListener("scroll", updateBodyScrollInfo);
  });
});
const getCheckoutList = () => {
  let arr = pageCompList.value.filter(item => !item.hideen);
  return arr;
};
// 设置题目列表
const setTopicList = setRespans => {
  let arr: any = [];
  setRespans.forEach(el => {
    arr.push({
      questionId: el.id,
      questionName: el.title,
      questionType: el.type,
      originalValue: JSON.stringify(el.dataValue),
      processValue: JSON.stringify(el.dataValue)
    });
  });
  return arr;
};
const isAllTrue = (arr, allowEmpty = false) => {
  if (!Array.isArray(arr)) {
    throw new Error("参数必须是数组");
  }
  if (arr.length === 0 && !allowEmpty) {
    return false;
  }
  return arr.every(Boolean);
};

// 获取操作系统
const getOS = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.indexOf("windows") !== -1) return "windows";
  if (userAgent.indexOf("mac os") !== -1) return "mac";
  if (userAgent.indexOf("android") !== -1) return "android";
  if (userAgent.indexOf("iphone") !== -1 || userAgent.indexOf("ipad") !== -1) return "ios";
  if (userAgent.indexOf("linux") !== -1) return "linux";
  return "unknown";
};
// 获取浏览器
const getBrowser = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.indexOf("edg") !== -1) return "edge";
  if (userAgent.indexOf("chrome") !== -1 && userAgent.indexOf("safari") !== -1) return "chrome";
  if (userAgent.indexOf("firefox") !== -1) return "firefox";
  if (userAgent.indexOf("safari") !== -1) return "safari";
  if (userAgent.indexOf("trident") !== -1 || userAgent.indexOf("msie") !== -1) return "ie";
  return "unknown";
};

const getClientInfo = () => {
  const ua = navigator.userAgent || "";
  // 操作系统
  let os = { name: "Unknown", version: "" };
  if (/Windows NT 10/.test(ua)) os = { name: "Windows", version: "10" };
  else if (/Windows NT 6\.3/.test(ua)) os = { name: "Windows", version: "8.1" };
  else if (/Windows NT 6\.2/.test(ua)) os = { name: "Windows", version: "8" };
  else if (/Windows NT 6\.1/.test(ua)) os = { name: "Windows", version: "7" };
  else if (/Mac OS X/.test(ua)) os = { name: "MacOS", version: ua.match(/Mac OS X ([\d_]+)/)?.[1].replace(/_/g, ".") || "" };
  else if (/Android/.test(ua)) os = { name: "Android", version: ua.match(/Android\s([\d.]+)/)?.[1] || "" };
  else if (/iPhone|iPad/.test(ua)) os = { name: "iOS", version: ua.match(/OS ([\d_]+)/)?.[1].replace(/_/g, ".") || "" };
  else if (/HarmonyOS/.test(ua)) os = { name: "HarmonyOS", version: "" };

  // 浏览器
  let browser = { name: "Unknown", version: "", major: "" };
  if (/Chrome\/([\d.]+)/.test(ua)) {
    const ver = ua.match(/Chrome\/([\d.]+)/)[1];
    browser = { name: "Chrome", version: ver, major: ver.split(".")[0] };
  } else if (/Safari\/([\d.]+)/.test(ua) && /Version\/([\d.]+)/.test(ua)) {
    const ver = ua.match(/Version\/([\d.]+)/)[1];
    browser = { name: "Safari", version: ver, major: ver.split(".")[0] };
  } else if (/Firefox\/([\d.]+)/.test(ua)) {
    const ver = ua.match(/Firefox\/([\d.]+)/)[1];
    browser = { name: "Firefox", version: ver, major: ver.split(".")[0] };
  }

  // 引擎
  let engine = { name: "Unknown", version: "" };
  if (/AppleWebKit\/([\d.]+)/.test(ua)) {
    engine = { name: "WebKit", version: ua.match(/AppleWebKit\/([\d.]+)/)[1] };
  }
  if (/Chrome\/([\d.]+)/.test(ua)) {
    engine = { name: "Blink", version: browser.version };
  }

  // CPU
  let cpu = { architecture: "" };
  if (/x64|Win64|amd64|x86_64/.test(ua)) cpu.architecture = "amd64";
  else if (/i686|x86/.test(ua)) cpu.architecture = "x86";
  else if (/arm|aarch64/.test(ua)) cpu.architecture = "arm";

  return {
    os,
    ua,
    cpu,
    device: {}, // 前端拿不到设备型号，只能空
    engine,
    browser
  };
};
/**
 * 判断是否是移动端
 * @returns {boolean} true = 移动端，false = PC
 */
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
function getDeviceType() {
  return isMobile() ? "Phone" : "PC";
}
</script>

<style lang="scss" scoped>
.survery-topic-page {
  position: absolute;
  inset: 0;
  z-index: 4;
  background: #ffffff;
}
.topic-page-container {
  position: relative;
  flex: 1;
  height: 100%;
  overflow: hidden;
  &::before {
    position: absolute;
    inset: 0;
    z-index: -2; // 保证文字在上面
    content: "";
    background: url("../dynamicForm/bg.jpg") center center;
    filter: blur(8px); // 只模糊背景图
    background-size: cover; /* 铺满容器，保持比例 */
  }
  .body-content {
    position: absolute;
    top: 2%;
    left: 50%;
    z-index: 2;
    width: 686px;
    height: calc(100% - 110px);
    padding: 20px 0 30px;
    overflow-y: auto;
    background: #ffffff;
    border-radius: 6px;
    transform: translateX(-50%);
    &.phone {
      top: 0;
      box-sizing: border-box;
      width: 100vw;
      height: 100vh;
      padding: 0;
      overflow-x: hidden !important;
      .form-item .comp-item {
        padding: 10px 20px 30px;
      }
      .form-footer {
        margin-top: 15px;
      }
      :deep(.comp-item .number) {
        left: 5px;
      }
    }
  }
}
:deep(.el-radio-button.is-active .el-radio-button__original-radio:not(:disabled) + .el-radio-button__inner) {
  color: #ffffff !important;
}
.comps {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}
.form-footer {
  width: 100%;
  height: 90px;
  margin-top: 30px;
  line-height: 90px;
}
:deep(.form-footer) {
  .submit {
    max-width: 100%;

    /* 不换行 */
    overflow: hidden;

    /* 隐藏超出部分 */
    text-overflow: ellipsis;
    white-space: nowrap;

    /* 显示省略号 */
  }
}
.no-data {
  margin: 20px;
  font-size: 16px;
  color: #666666;
  text-align: center;
  img {
    width: 300px;
    margin: 20px;
  }
}
.survery-topic-page,
.topic-page-container {
  overflow-x: hidden; // 防止 body-content 溢出撑开
}
:deep(.el-dialog__header) {
  display: none !important;
}
.popup-icon {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 20px;
  .el-icon {
    color: var(--el-color-primary);
  }
}
.popup-text {
  margin-bottom: 15px;
  text-align: center;
}
</style>
