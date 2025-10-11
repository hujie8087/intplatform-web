<template>
  <div class="form-index-container add-survey-setting">
    <div class="nav-data">
      <div class="header">
        <div class="callback" @click="backButton">
          <img src="@/assets/images/form-editor/callback.svg" alt="" />
        </div>
        <div class="title-data">
          <el-text class="name">{{ projectName }} </el-text>
        </div>
        <div class="control" v-if="showBtn">
          <div class="cont-item">
            <el-button type="primary" :icon="Finished" v-auth="['survey:project:saveAll']" @click="saveSurvey">
              <span class="name">{{ $t("survey.form.submit") }}</span>
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
import { ref, shallowRef, onMounted, provide } from "vue";
import { Finished } from "@element-plus/icons-vue";
import FormSidebar from "./components/FormSidebar.vue";
import questionBank from "../dynamicForm/index.vue";
import sample from "./components/sample.vue"; //样本
import setting from "./components/setting.vue"; //设置
import publish from "./components/publish.vue"; // 发布
import stat from "../stat/index.vue"; // 统计
import { useRoute } from "vue-router";
import { comeThemeColor, outThemeColor } from "../dynamicForm/components/compConfig";

const $route = useRoute(); // 路由
const projectKey = $route.query.key;
const current = $route.query.current;
const projectName = $route.query.projectName;
import { useTabsStore } from "@/stores/modules/tabs";
const tabStore = useTabsStore();
provide("projectKey", projectKey);
const dynamicRef = ref();
// let isCollapse = ref(false);
// default-active 需要字符串类型的当前激活路由
const menuItemList = {
  questionBank, // 题库
  sample, // 样本
  setting, // 设置
  publish, // 发布
  stat // 统计
};
const defaultActiveMenu = shallowRef(menuItemList[current]); // 默认激活第一个菜单
const currentSideItemType = ref(current); // 当前侧边栏选中类型
const showBtn = ref(true);
const selectSideItemType = async (item: string) => {
  currentSideItemType.value = item;
  defaultActiveMenu.value = menuItemList[item]; // 动态组件
  showBtn.value = item == "questionBank";
};

const backButton = () => {
  let href = window.location.hash.slice(1);
  tabStore.removeTabs(href, true);
  outThemeColor();
};
// 保存问卷
const saveSurvey = async () => {
  if (dynamicRef.value?.saveSurveryFun) {
    try {
      await dynamicRef.value.saveSurveryFun(projectKey);
    } catch (error) {
      console.log("保存失败");
    }
  } else {
    console.warn("子组件没有暴露 saveSurveryFun  方法");
  }
};
onMounted(() => {
  // 初始化主题数据
  comeThemeColor();
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
  position: relative;
  height: 56px;
  padding: 0 50px;
  line-height: 1;
  box-shadow: inset 0 -1px 0 #e7e7e7;
  .title-data {
    display: flex;
    align-items: center;
    height: 56px;
    font-size: 16px;
    .name {
      i {
        font-style: normal;
        color: #333333;
        vertical-align: middle;
      }
      b {
        color: var(--el-color-success);
      }
    }
  }
  .callback {
    position: absolute;
    top: 50%;
    left: 12px;
    cursor: pointer !important;
    transform: translateY(-45%);
    img {
      width: 24px;
      height: 24px;
      cursor: pointer;
    }
  }
  .control {
    position: absolute;
    top: 50%;
    right: 15px;
    display: flex;
    flex-grow: 2;
    transform: translateY(-50%);
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
  .right-content-container {
    flex: 1;
    height: 100%;
    overflow: scroll;
  }
}
</style>
