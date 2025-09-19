<template>
  <div class="form-index-container add-survey-setting">
    <div class="nav-data">
      <div class="header">
        <div class="callback" @click="backButton">
          <img src="@/assets/images/form-editor/callback.svg" alt="" />
        </div>
        <div class="title-data">
          <span class="name">问卷调查</span>
        </div>
        <div class="control">
          <div class="cont-item">
            <el-button type="primary" :icon="Finished" @click="saveSurvey">
              <span class="name">保存</span>
            </el-button>
          </div>
          <!-- <div class="cont-item">
            <el-button type="primary" :icon="Pointer" color="#1677FF" size="default">
              <span class="name"> 发布 </span>
            </el-button>
          </div> -->
        </div>
      </div>
    </div>
    <div class="content editor-content">
      <!-- 菜单栏 -->
      <FormSidebar @select-side-item-type="selectSideItemType" :current-side-item-type="currentSideItemType"></FormSidebar>
      <!-- 内容栏 -->
      <div class="right-content-container">
        <component :is="defaultActiveMenu" ref="dynamicRef" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="addSurvery">
// reactive
import { ref, shallowRef, reactive, onMounted, provide } from "vue";
import { getProjectDetail } from "@/api/modules/questionnaire/myProject";
import { Finished } from "@element-plus/icons-vue";
import FormSidebar from "./components/FormSidebar.vue";
import questionBank from "../dynamicForm/index.vue";
import sample from "./components/sample.vue"; //样本
import setting from "./components/setting.vue"; //设置
import publish from "./components/publish.vue"; // 发布
import stat from "../stat/index.vue"; // 统计
import { useRouter, useRoute } from "vue-router";
const $route = useRoute(); // 路由
const projectKey = $route.query.key;

provide("projectKey", projectKey);
const dynamicRef = ref();
// let isCollapse = ref(false);
const router = useRouter(); // 路由器
// default-active 需要字符串类型的当前激活路由
const menuItemList = {
  questionBank, // 题库
  sample, // 样本
  setting, // 设置
  publish, // 发布
  stat // 统计
};
const defaultActiveMenu = shallowRef(menuItemList["questionBank"]); // 默认激活第一个菜单
const currentSideItemType = ref("questionBank"); // 当前侧边栏选中类型

const selectSideItemType = async (item: string) => {
  await queryProjectDetail();
  if (projectDetail.status === 1) {
    saveSurvey();
  }
  currentSideItemType.value = item;
  defaultActiveMenu.value = menuItemList[item]; // 动态组件
};

const backButton = () => {
  router.replace({ path: "/questionnaire/myProject" });
};
// 保存问卷
const saveSurvey = async () => {
  if (dynamicRef.value?.saveSurveryFun) {
    try {
      await dynamicRef.value.saveSurveryFun(projectKey);
      updateTime.value = formatTime();
    } catch (error) {
      console.log("保存失败");
    }
    // 保存成功后更新时间（根据实际需求判断是否需要加成功判断）
  } else {
    console.warn("子组件没有暴露 saveSurveryFun  方法");
  }
};

let updateTime = ref<string>(); // 初始为空，显示"暂未保存"

// 格式化时间为 "YYYY-MM-DD HH:mm:ss"（工具函数）
const formatTime = (): string => {
  const now = new Date();
  const padZero = (num: number) => num.toString().padStart(2, "0");
  return `${now.getFullYear()}-${padZero(now.getMonth() + 1)}-${padZero(now.getDate())} ${padZero(now.getHours())}:${padZero(now.getMinutes())}:${padZero(now.getSeconds())}`;
};

// 弹窗
interface projectDetailType {
  updateTime: string;
  status?: any;
}
const projectDetail = reactive<projectDetailType>({
  updateTime: "",
  status: null
});

const queryProjectDetail = async () => {
  let res: any = await getProjectDetail(projectKey);
  projectDetail.status = res?.data?.status;
  updateTime.value = res?.data?.updateTime;
};

onMounted(() => {
  queryProjectDetail();
});
</script>

<style scoped lang="scss">
.form-index-container {
  position: absolute;
  inset: 0;
  z-index: 6;
  min-width: 1260px;
  height: 100%;
  overflow: hidden;
  background: #f6f8fa;
}
.nav-data {
  height: 56px;
  padding: 0 50px;
  line-height: 1;
  box-shadow: inset 0 -1px 0 #e7e7e7;
  .title-data {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 60px;
    font-size: 16px;
  }
  .callback {
    position: absolute;
    left: 12px;
    padding-top: 16px;
    cursor: pointer !important;
    img {
      width: 24px;
      height: 24px;
      cursor: pointer;
    }
  }
  .control {
    position: absolute;
    top: 8px;
    right: 6px;
    display: flex;
    flex-grow: 2;
    .cont-item {
      margin-right: 10px;
      cursor: pointer;
    }
    .btn-icon {
      width: 18px;
      padding: 0;
      margin-top: -2px;
      filter: grayscale(1);
    }
    &:hover {
      .btn-icon {
        filter: grayscale(0);
      }
    }
    .name {
      padding: 0 4px;
    }
  }
}
.editor-content {
  display: flex;
  height: calc(100% - 86px);
  padding: 0;

  // grid-template-columns: 56px 270px 1fr 260px;

  // @media (width <= 1400px) {
  //   grid-template-columns: 56px 220px 1fr 220px;
  //   overflow-x: auto;
  //   .form {
  //     width: auto;
  //   }
  // }

  // @media (width <= 1400px) {
  //   grid-template-columns: 56px 260px 1fr 250px;
  //   overflow-x: auto;
  //   .form {
  //     width: auto;
  //   }
  // }
  // ::v-deep(.content .compList .item) {
  //   font-size: 14px;
  // }
  .right-content-container {
    flex: 1;
    height: 100%;
    overflow: scroll;
  }
}
</style>
