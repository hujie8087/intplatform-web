<template>
  <div class="alarm-list-panel">
    <div class="alarm-list-header">
      <h2 class="alarm-list-title">实时预警列表</h2>
      <!-- 筛选按钮 -->
      <div class="filter-button">
        <el-popover
          v-model:visible="showFilterDialog"
          placement="bottom-end"
          :width="350"
          trigger="click"
          popper-class="filter-popover"
        >
          <template #reference>
            <el-button type="primary" :icon="Filter" size="small" class="alarm-list-count">
              筛选
              <el-badge v-if="appliedFiltersCount > 0" :value="appliedFiltersCount" />
            </el-button>
          </template>

          <!-- 筛选表单内容 -->
          <div class="filter-panel">
            <el-form ref="formRef" :model="currentFilters" label-width="80px" size="small" class="filter-form">
              <el-form-item label="订单号">
                <el-input v-model="currentFilters.orderNumber" placeholder="请输入订单号" size="small" clearable />
              </el-form-item>

              <el-form-item label="姓名">
                <el-input v-model="currentFilters.nickName" placeholder="姓名" size="small" clearable />
              </el-form-item>

              <el-form-item label="工号">
                <el-input v-model="currentFilters.userName" placeholder="请输入工号" size="small" clearable />
              </el-form-item>
            </el-form>

            <div class="filter-actions">
              <el-button size="small" @click="handleFilterReset"> 重置 </el-button>
              <el-button type="primary" size="small" :loading="searchLoading" @click="handleFilterConfirm"> 确定 </el-button>
            </div>
          </div>
        </el-popover>
        <span v-if="filteredAlarms.length" class="alarm-list-count">
          共 <span style=" font-weight: bold;color: red">{{ filteredAlarms.length }}</span> 条
        </span>
      </div>
    </div>
    <div class="alarm-list-content">
      <div
        v-for="(alarm, index) in filteredAlarms"
        :key="alarm.id ?? index"
        class="alarm-card"
        :class="getLevelClass(alarm.level)"
        @click="handleAlarmClick(alarm)"
      >
        <div class="alarm-card__header">
          <div class="alarm-card__order">
            <span class="alarm-card__label">订单号</span>
            <span class="alarm-card__order-number">
              {{ getOrderNumber(alarm) }}
            </span>
          </div>
          <span class="alarm-card__level-tag">
            {{ getLevelLabel(alarm.level) }}
          </span>
        </div>

        <div class="alarm-card__meta">
          <div class="alarm-card__meta-item">
            <span class="meta-label">报警时间</span>
            <span class="meta-value">{{ formatDate(alarm.reportTime) }}</span>
          </div>
          <div class="alarm-card__meta-item">
            <span class="meta-label">报警人</span>
            <span class="meta-value">{{ alarm.reportBy || "--" }}</span>
          </div>
          <div class="alarm-card__meta-item">
            <span class="meta-label">工号</span>
            <span class="meta-value">{{ alarm.createBy || "--" }}</span>
          </div>
          <div class="alarm-card__meta-item">
            <span class="meta-label">设备号</span>
            <span class="meta-value">{{ alarm.deviceType || "--" }}</span>
          </div>
          <div class="alarm-card__meta-item">
            <span class="meta-label">联系电话</span>
            <span class="meta-value">{{ alarm.tel || "--" }}</span>
          </div>
          <div class="alarm-card__meta-item">
            <span class="meta-label">系统来源</span>
            <span class="meta-value">{{ alarm.systemSource === 0 ? "后勤" : alarm.systemSource === 1 ? "安环" : "其他" }}</span>
          </div>
        </div>

        <div class="alarm-card__location">
          <span class="location-icon" aria-hidden="true"></span>
          <p class="location-text">{{ formatLocation(alarm) }}</p>
        </div>

        <p v-if="alarm.reportDescription" class="alarm-card__description">
          {{ alarm.reportDescription }}
        </p>
      </div>

      <div v-if="props.alarms.length === 0" class="no-alarms">暂无未处理报警</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Filter } from "@element-plus/icons-vue";

interface AlarmData {
  createBy: string;
  delFlag: string;
  deviceType: string;
  id: number;
  latitude: number;
  level: number;
  longitude: number;
  orderNo: string;
  params: any;
  processingBy: string;
  processingResult: string;
  reportBy: string;
  reportDescription: string;
  reportLocation: string;
  reportTime: string;
  systemSource: number;
  tel: string;
}

interface Props {
  alarms: AlarmData[];
}
// 高级筛选相关
const showFilterDialog = ref(false);
const currentFilters = ref({
  orderNumber: "",
  nickName: "",
  userName: "",
  userType: ""
});
const appliedFiltersCount = ref(0);
const searchLoading = ref(false);

const props = defineProps<Props>();
const emit = defineEmits<{
  alarmClick: [alarm: AlarmData];
}>();

const filteredAlarms = computed(() => {
  console.log("filteredAlarms:", props.alarms);
  return props.alarms.filter(alarm => {
    return (
      alarm.orderNo.includes(currentFilters.value.orderNumber) &&
      alarm.reportBy.includes(currentFilters.value.nickName) &&
      alarm.createBy.includes(currentFilters.value.userName)
    );
  });
});

const levelLabels = ["常规预警", "一级预警", "二级预警", "三级预警"];

const handleAlarmClick = (alarm: AlarmData) => {
  emit("alarmClick", alarm);
};

const formatDate = (value?: string) => {
  if (!value) return "未知时间";
  return value.replace("T", " ").replace(/\.\d+Z?$/, "");
};

const getOrderNumber = (alarm: AlarmData) => {
  return alarm.orderNo || "未知订单";
};

const getLevelLabel = (level?: number) => {
  if (level === undefined || level === null) return "未分级";
  return levelLabels[level] || `L${level} 预警`;
};

const getLevelClass = (level?: number) => {
  const levelValue = level ?? 0;
  return `level-${levelValue}`;
};

const formatLocation = (alarm: AlarmData) => {
  if (alarm.reportLocation) {
    return alarm.reportLocation;
  }

  if (typeof alarm.latitude === "number" && typeof alarm.longitude === "number") {
    return `经度: ${alarm.longitude.toFixed(6)}, 纬度: ${alarm.latitude.toFixed(6)}`;
  }

  return "未记录地点";
};

// 重置筛选
const handleFilterReset = () => {
  currentFilters.value = {
    orderNumber: "",
    nickName: "",
    userName: "",
    userType: ""
  };
  appliedFiltersCount.value = 0;
  handleClearSearch();
};
// 清除搜索
const handleClearSearch = () => {
  showFilterDialog.value = false;
};
// 处理筛选确认
const handleFilterConfirm = async () => {
  // 计算应用的筛选条件数量
  let count = 0;
  if (currentFilters.value.orderNumber.trim()) count++;
  if (currentFilters.value.nickName.trim()) count++;
  if (currentFilters.value.userName.trim()) count++;
  if (currentFilters.value.userType.trim()) count++;

  appliedFiltersCount.value = count;

  showFilterDialog.value = false;
};
</script>

<style scoped>
.alarm-list-panel {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 450px;
  height: 100%;
  padding: 80px 18px 18px;
  overflow: hidden;
  color: #edf6ff;
  background: linear-gradient(90deg, rgb(8 24 44 / 96%) 0%, rgb(8 24 44 / 75%) 48%, rgb(8 24 44 / 20%) 100%);
}
.alarm-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.alarm-list-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
}
.alarm-list-count {
  padding: 4px 10px;
  margin-left: 10px;
  font-size: 12px;
  color: rgb(210 233 255 / 78%);
  background: rgb(210 233 255 / 12%);
  backdrop-filter: blur(6px);
  border-radius: 8px;
}
.alarm-list-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  padding-right: 4px;
  overflow-y: auto;
}
.alarm-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  border-radius: 12px;
  transition:
    transform 0.28s ease,
    box-shadow 0.28s ease,
    background 0.28s ease;
}
.alarm-card:hover {
  transform: translateY(-2px);
}
.alarm-card__header {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  justify-content: space-between;
}
.alarm-card__order {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.alarm-card__label {
  font-size: 12px;
  color: rgb(214 232 255 / 55%);
  letter-spacing: 1px;
}
.alarm-card__order-number {
  font-size: 14px;
  font-weight: 600;
  color: #f2f8ff;
  letter-spacing: 0.5px;
}
.alarm-card__level-tag {
  align-self: flex-start;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #b6d7ff;
  background: rgb(135 184 255 / 18%);
  border-radius: 8px;
}
.alarm-card__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
}
.alarm-card__meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.meta-label {
  font-size: 10px;
  color: rgb(208 229 255 / 60%);
}
.meta-value {
  overflow: hidden;
  font-size: 12px;
  font-weight: 500;
  color: #f8fbff;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.alarm-card__location {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 8px 0 0;
  border-top: 1px solid rgb(204 227 255 / 12%);
}
.location-icon {
  width: 10px;
  height: 10px;
  margin-top: 4px;
  background: linear-gradient(135deg, #7bc4ff, #c0e3ff);
  border-radius: 50%;
}
.location-text {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: rgb(233 244 255 / 85%);
}
.alarm-card__description {
  margin: 0;
  font-size: 11px;
  line-height: 1.65;
  color: red;
}
.no-alarms {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: rgb(209 227 246 / 75%);
  letter-spacing: 1px;
  background: rgb(23 45 70 / 35%);
  backdrop-filter: blur(8px);
  border-radius: 12px;
}
.level-0 .alarm-card__level-tag {
  color: #d2f5d8;
  background: rgb(129 199 132 / 22%);
}
.level-1 .alarm-card__level-tag {
  color: #ffe3bd;
  background: rgb(255 203 110 / 22%);
}
.level-2 .alarm-card__level-tag {
  color: #ffcfc6;
  background: rgb(255 125 105 / 22%);
}
.level-3 .alarm-card__level-tag {
  color: #e2d6ff;
  background: rgb(169 128 255 / 22%);
}
.filter-actions {
  margin-top: 10px;
  text-align: right;
}

@media (width <= 768px) {
  .alarm-list-panel {
    width: 100%;
    padding: 100px 18px 28px;
  }
  .alarm-card__meta {
    grid-template-columns: 1fr;
  }
}
</style>
