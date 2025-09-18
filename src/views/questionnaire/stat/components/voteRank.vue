<template>
  <!-- <el-empty description="暂无投票排名统计" /> -->
  <div class="vote-view">
    <div class="header">
      <div class="left">
        <el-text size="large" class="title">投票概览</el-text>
        <el-select v-model="currentSelect" class="m-2" placeholder="选择" size="default" style="width: 240px">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
      <div class="refresh">
        <el-tooltip class="box-item" effect="dark" content="点击刷新" placement="top-start">
          <el-icon @click="refresh" :class="{ rotating: isRotating }"><RefreshRight /></el-icon>
        </el-tooltip>
      </div>
    </div>
    <el-divider border-style="dashed" />
    <div class="content">
      <!-- 数据为空状态 -->
      <div v-if="rankingData.length === 0" class="empty-state">
        <el-empty description="暂无数据" />
      </div>
      <!-- 排行榜列表 -->
      <div v-else class="ranking-container">
        <ul class="ranking-list">
          <li v-for="(item, index) in rankingData" :key="index" class="ranking-item">
            <div
              class="rank-area"
              :class="{
                'top-one': index === 0,
                'top-two': index === 1,
                'top-three': index === 2,
                normal: index >= 3
              }"
            >
              <span class="rank-num">{{ index + 1 }}</span>
              <p class="singer">{{ item.title }}</p>
            </div>
            <div class="vote" :class="{ 'top-style': index < 3 }">{{ item.value }} 票</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="voteRank">
import { ref, onMounted, watch } from "vue";
import { getProjectReportRank } from "@/api/modules/questionnaire/stat";
import { useRoute } from "vue-router";
const route = useRoute();
const key = route.query.key as string | undefined;

const currentSelect = ref<any>(null);
const options = ref<any>([]);
const resultData = ref<any>([]);
const rankingData = ref([]);

const getReportRank = async () => {
  const res = await getProjectReportRank(key);
  if (res.data) {
    // options设置
    currentSelect.value = res.data[0]?.label;
    options.value = [];
    res.data.forEach(element => {
      options.value.push({
        label: element.label,
        value: element.label
      });
    });
    const dataMap: any[] = [];
    (res.data as any).forEach(item => {
      dataMap.push({
        label: item.label,
        result: Object.entries(item.dataItemMap)
          .map(([key, value]) => ({ title: key, value })) // 转成 { title, value } 结构
          .sort((a: any, b: any) => b.value - a.value)
      });
    });
    resultData.value = dataMap;
    // 手动触发一次数据更新
    rankingData.value = resultData.value.find((item: any) => item.label === currentSelect.value)?.result || [];
  }
};

watch(currentSelect, newVal => {
  let data = resultData.value.filter(item => item.label == newVal);
  rankingData.value = [];
  rankingData.value = data[0]?.result;
  console.log(rankingData.value);
});

onMounted(() => {
  getReportRank();
});

const isRotating = ref(false);
const refresh = () => {
  // 触发旋转动画
  isRotating.value = true;
  getReportRank();
  // 动画结束后重置状态
  setTimeout(() => {
    isRotating.value = false;
  }, 500);
};
</script>

<style scoped lang="scss">
.vote-view {
  min-height: calc(100vh - 200px);
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 20px;
    .title {
      margin-right: 20px;
    }
    .refresh {
      cursor: pointer;
      .el-icon {
        font-size: 18px; /* 调整图标大小 */
        cursor: pointer;
        transition: transform 0.5s ease-in-out; /* 平滑过渡效果 */
      }
      .rotating {
        transform: rotate(180deg); /* 旋转180度 */
      }
    }
  }
}
.ranking-container {
  width: 50%;
  padding: 20px;
  margin: 0 auto;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgb(0 0 0 / 8%); // 增加卡片阴影，提升质感
  .ranking-list {
    padding: 0;
    margin: 0;
    list-style: none;
    .ranking-item {
      display: flex;
      align-items: center;
      justify-content: space-between; // 左右分栏
      padding: 15px 20px; // 增大内边距
      margin-bottom: 10px;
      border-radius: 4px;
      transition: all 0.2s ease; // hover 过渡
      &:hover {
        box-shadow: 0 4px 16px rgb(0 0 0 / 10%); // hover 阴影
        transform: translateY(-2px);
      }

      // 排名区域
      .rank-area {
        display: flex;
        align-items: center;
        .rank-num {
          width: 32px;
          height: 32px;
          margin-right: 12px;
          font-size: 16px;
          font-weight: bold;
          line-height: 32px;
          color: #ffffff;
          text-align: center;
          border-radius: 50%;
        }

        // Top3 特殊样式
        &.top-one .rank-num {
          background: linear-gradient(45deg, #ffd700, #ffc107);
        }
        &.top-two .rank-num {
          background: linear-gradient(45deg, #c0c0c0, #d3d3d3);
        }
        &.top-three .rank-num {
          background: linear-gradient(45deg, #cd7f32, #d4a76a);
        }

        // 4名及以后
        &.normal .rank-num {
          color: #909399;
          background-color: #f0f2f5;
        }
        .singer {
          margin: 0;
          font-size: 18px;
          font-weight: 500;
          color: #333333;
        }
      }

      // 票数区域
      .vote {
        font-size: 16px;
        font-weight: 500;
        color: #606266;
        &.top-style {
          color: #ff7d00; // Top3 票数用醒目的橙色
        }
      }
    }
  }
}
</style>
