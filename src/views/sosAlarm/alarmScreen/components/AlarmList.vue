<template>
  <div class="alarm-list-panel">
    <div class="alarm-list-header">
      <h2 class="alarm-list-title">实时预警列表</h2>
      <span v-if="alarms.length" class="alarm-list-count"> 共 {{ alarms.length }} 条 </span>
    </div>
    <div class="alarm-list-content">
      <div
        v-for="(alarm, index) in alarms"
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
            <span class="meta-value">{{ alarm.reportBy || "未知" }}</span>
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

      <div v-if="alarms.length === 0" class="no-alarms">暂无未处理报警</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface AlarmData {
  id?: number;
  level?: number;
  reportDescription?: string;
  reportBy?: string;
  reportLocation?: string;
  reportTime?: string;
  tel?: string;
  latitude?: number;
  longitude?: number;
  deviceNo?: string;
  deviceCode?: string;
  deviceId?: string;
  orderNumber?: string;
  orderNo?: string;
}

interface Props {
  alarms: AlarmData[];
}

const { alarms } = defineProps<Props>();
const emit = defineEmits<{
  alarmClick: [alarm: AlarmData];
}>();

const levelLabels = ["常规预警", "一级预警", "二级预警", "三级预警"];

const handleAlarmClick = (alarm: AlarmData) => {
  emit("alarmClick", alarm);
};

const formatDate = (value?: string) => {
  if (!value) return "未知时间";
  return value.replace("T", " ").replace(/\.\d+Z?$/, "");
};

const getOrderNumber = (alarm: AlarmData) => {
  return alarm.orderNumber || alarm.orderNo || "未知订单";
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
