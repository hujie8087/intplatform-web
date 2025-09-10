<template>
  <div class="stat-page">
    <div class="content-card">
      <el-tabs type="border-card" v-model="activeName" class="demo-tabs" @tab-click="handleClick">
        <el-tab-pane label="列表视图" name="first">
          <listView v-if="activeName === 'first'" />
        </el-tab-pane>
        <el-tab-pane label="统计视图" name="second">
          <statView v-if="activeName === 'second'" />
        </el-tab-pane>
        <el-tab-pane label="数据分析" name="third">
          <dataAnalyze v-if="activeName === 'third'" />
        </el-tab-pane>
        <el-tab-pane label="投票排名" name="fourth">
          <voteRank v-if="activeName === 'fourth'" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts" name="setting">
import { ref } from "vue";
import listView from "./components/listView.vue";
import statView from "./components/statView.vue";
import dataAnalyze from "./components/dataAnalyze.vue";
import voteRank from "./components/voteRank.vue";
import type { TabsPaneContext } from "element-plus";

const activeName = ref("first");
const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event);
};
</script>

<style scoped lang="scss">
// 统一变量：便于维护
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
.stat-page ::v-deep .el-tabs--border-card > .el-tabs__content {
  padding: 0;
}
.stat-page {
  display: flex;
  align-items: flex-start; // 改为顶部对齐，避免内容过长时垂直居中异常
  justify-content: center;
  min-height: 100%; // 使用最小高度，避免内容不足时背景异常
  margin: 0;
  overflow: hidden;
  background-image: url("../dynamicForm/bg.png");
  background-repeat: round;
  .content-card {
    width: 94%;
    min-height: 80%;
    margin-top: $spacing-lg;
    overflow: hidden;
    background: #ffffff;
  }
}
</style>
