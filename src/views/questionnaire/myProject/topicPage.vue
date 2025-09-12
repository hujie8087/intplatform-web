<template>
  <!-- 答卷页面 -->
  <div class="survery-topic-page">
    <div class="drawer-header">
      <span>问卷答题</span>
      <div class="controls">
        <el-radio-group size="default" v-model="previewType">
          <el-radio-button label="Phone">移动端</el-radio-button>
          <el-radio-button label="PC">桌面端</el-radio-button>
        </el-radio-group>
      </div>
      <el-button type="primary" :icon="CloseBold" link class="close-topic-btn" @click="closeTopicBtn"></el-button>
    </div>
    <div class="topic-page-container">
      <div :class="['body-content', previewType === 'Phone' ? 'phone' : '']">
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
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
type PreviewType = "Phone" | "PC";
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { CloseBold, Check } from "@element-plus/icons-vue";
import FormComponent from "../dynamicForm/components/componentsForm/index.vue";
import SupportComp from "../dynamicForm/preview/component/SupportComp.vue";
import { getSurveyTopicList, getSurveySetting } from "@/api/modules/questionnaire/topicPage";
import { v4 as uuidv4 } from "uuid";
const route = useRoute();
const router = useRouter();
const rulesObj = reactive({});
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
// 关闭页面
const closeTopicBtn = () => {
  router.replace({ path: "/" }); // 跳转到根路径
};

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
    let { projectItems = [], pageFooter = {}, selectForm = {} } = response.data;
    projectItems.forEach(el => {
      pageCompList.value.push(el.expand);
    });
    pageFooter.value = pageFooter;
    selectForm.value = selectForm;
  }
};
// 获得问卷设置
const setRulesObj = async projectKey => {
  try {
    let deviceId = localStorage.getItem("device_id")!;
    let response = await getSurveySetting({ projectKey, fingerprint: deviceId });
    if (response.code == 200) {
      Object.assign(rulesObj, response.data);
      initTopicList(projectKey);
    }
  } catch (error: any) {
    console.log("///////////", error);
    erroryText.value = error.msg;
  }
};
const submitAnswerSheet = () => {
  console.log("*************");
};
onMounted(async () => {
  const projectKey = route.query?.projectKey ?? "40d90ea8cfe24966b5b0cfefaab61990";
  if (!localStorage.getItem("device_id")) {
    localStorage.setItem("device_id", uuidv4());
  }
  //   setRulesObj(projectKey);
  initTopicList(projectKey);
});
</script>

<style lang="scss" scoped>
.survery-topic-page {
  position: absolute;
  inset: 0;
  z-index: 4;
  background: #ffffff;
}
.drawer-header {
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
  margin-bottom: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  .controls {
    .cont-item {
      padding: 2px 5px;
    }
  }
  .close-topic-btn {
    :deep(.el-icon) {
      font-size: 20px;
    }
  }
}
.topic-page-container {
  position: relative;
  flex: 1;
  height: calc(100vh - 68px);
  overflow: auto;
  &::before {
    position: absolute;
    inset: 0;
    z-index: -2; // 保证文字在上面
    content: "";
    background: url("../dynamicForm/preview/bg.png") center center;
    filter: blur(8px); // 只模糊背景图
    background-size: cover; /* 铺满容器，保持比例 */
  }
  .body-content {
    position: absolute;
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
      width: 392px;
      overflow-x: hidden !important;
      .form-item .comp-item {
        padding: 10px 20px 30px;
      }
      .form-footer {
        width: 390px;
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
</style>
