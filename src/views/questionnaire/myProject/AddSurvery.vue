<template>
  <dv-full-screen-container>
    <div class="form-index-container add-survey-setting">
      <el-card class="header-container">
        <el-row align="middle" type="flex" :gutter="5" style="height: 100%">
          <el-icon class="survey-el-icon-back" @click="$router.back(-1)"><Back /></el-icon>
          <img class="survey-header-logo" src="@/assets/images/logo.png" @click="$router.push({ path: '/' })" />
          <div style="flex: 1"></div>
          <button class="survey-button-preview" @click="previewDialogVisible = true">
            <el-icon class="button-preview"><View /></el-icon>
            预览
          </button>
          <button class="survey-button-save" @click="saveProjectAsTemplateHandle">
            <el-icon class="button-save"><DocumentChecked /></el-icon>
            保存为模板
          </button>
          <!-- <el-button :icon="View" >预览</el-button>-->
          <!-- <el-button type="primary" :icon="DocumentChecked" @click="saveProjectAsTemplateHandle">保存为模板</el-button> -->
        </el-row>
      </el-card>
      <div class="main-container">
        <div class="left-menu-container">
          <el-menu :collapse="isCollapse" :default-active="defaultActiveMenu" class="el-menu-vertical" @select="menuSelectHandle">
            <el-menu-item v-for="menuItem in menuItemList" :key="menuItem.route" :index="menuItem.route">
              <el-icon>
                <component :is="menuItem.icon" />
              </el-icon>
              <template #title>
                {{ menuItem.title }}
              </template>
            </el-menu-item>
          </el-menu>
          <el-icon v-if="!isCollapse" class="el-icon-d-arrow-left" @click="collapseHandle"><DArrowLeft /></el-icon>
          <el-icon v-else class="el-icon-d-arrow-right" @click="collapseHandle"><DArrowRight /></el-icon>
        </div>
        <div class="right-content-container">
          <!-- <router-view /> -->
          <component :is="defaultActiveMenu" />
          <!-- <EditComponents /> -->
        </div>
      </div>
      <!-- <el-dialog :visible.sync="previewDialogVisible" destroy-on-close fullscreen>
        <pre-view :key="previewKey" :preview-qrcode="true" />
      </el-dialog> -->
    </div>
  </dv-full-screen-container>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import {
  Back,
  View,
  DocumentChecked,
  Edit,
  Menu,
  Setting,
  User,
  VideoPlay,
  DataLine,
  DArrowLeft,
  DArrowRight
} from "@element-plus/icons-vue";
// useRouter
import { useRoute } from "vue-router";
import { saveTemplate } from "@/api/modules/questionnaire/myProject";
import EditComponents from "./from/editor/index.vue";

const $route = useRoute(); // 路由
const id = $route.query.id;
let isCollapse = ref(false);
// const router = useRouter(); // 路由器
const previewDialogVisible = ref(false); // 预览弹窗
const menuItemList = reactive([
  {
    title: "编辑",
    icon: Edit,
    route: "/project/form/editor",
    comment: EditComponents
  },
  {
    title: "逻辑",
    icon: Menu,
    route: "/project/form/logic"
  },
  {
    title: "外观",
    icon: View,
    route: "/project/form/theme"
  },
  {
    title: "设置",
    icon: Setting,
    route: "/project/form/setting"
  },
  {
    title: "样本",
    icon: User,
    route: "/project/form/sample"
  },
  {
    title: "发布",
    icon: VideoPlay,
    route: "/project/form/publish"
  },
  {
    title: "统计",
    icon: DataLine,
    route: "/project/form/statistics"
  }
]);
// default-active 需要字符串类型的当前激活路由
const defaultActiveMenu = ref(menuItemList[0].comment); // 默认激活第一个菜单

// 保存为模板功能
const saveProjectAsTemplateHandle = async () => {
  await saveTemplate({ projectKey: id });
};
const menuSelectHandle = () => {
  // router.replace({ path: index, query: { key: id } });
};
const collapseHandle = () => {
  isCollapse.value = !isCollapse.value;
  // this.$store.dispatch("form/setIsCollapse", isCollapse).then(() => {
  //   this.isCollapse = isCollapse;
  // });
};
onMounted(() => {
  console.log("789");
});
</script>

<style scoped>
.add-survey-setting {
  width: 100%;
  height: 100%;
  background: #ffffff;
}
.add-survey-setting .header-container {
  height: 50px;
  padding: 0 20px;
  background: #f6f8fa;
  box-shadow: inset 0 -1px #e7e7e7;
}
.add-survey-setting::v-deep(.el-card__body) {
  height: 100%;
  padding: 0;
}
.survey-el-icon-back {
  margin-right: 75px;
  font-size: 24px;
  font-weight: 550;
  color: #000000;
  cursor: pointer;
}
.survey-el-icon-back:hover {
  color: rgb(32 160 255);
}
.survey-header-logo {
  height: 40px;

  /* width: 200px; */
}
.survey-button-preview,
.survey-button-save {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 4px 15px;

  /* border-color: #d9d9d9; */
  font-size: 14px;
  font-weight: 400;
  color: rgb(0 0 0 / 88%);
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  background-color: #ffffff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
}
.survey-button-save {
  margin-left: 10px;
  color: #ffffff;
  background: #1677ff;
}
.survey-button-preview .button-preview,
.survey-button-save .button-save {
  margin-right: 4px;
  font-size: 18px;
  color: rgb(0 0 0 / 88%);
}
.survey-button-save .button-save {
  color: #ffffffff;
}
.add-survey-setting .main-container::v-deep(.el-menu) {
  background-color: transparent;
  border: none;
}
.add-survey-setting .main-container {
  display: flex;
  flex-direction: row;
  width: 100vw;
  height: calc(100vh - 60px);
}
.add-survey-setting .right-content-container {
  width: calc(100vw - 100px);
  height: calc(100vh - 60px);
  overflow-x: hidden;
}
.add-survey-setting .left-menu-container {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-width: 100px;
  text-align: center;
  border-right: solid 1px #e6e6e6;
}
.add-survey-setting .left-menu-container .el-menu-vertical:not(.el-menu--collapse) {
  width: 100px;
}
.add-survey-setting .el-icon-d-arrow-left,
.add-survey-setting .el-icon-d-arrow-right {
  display: inline-block;
  width: 100%;
  margin-bottom: 100px;
  font-size: 19px;
  font-weight: 550;
  color: #000000;
  cursor: pointer;
}
.add-survey-setting .el-icon-d-arrow-right:hover {
  color: rgb(32 160 255);
}
.add-survey-setting::v-deep(.preview-container) {
  background-color: #ffffff;
}
</style>
