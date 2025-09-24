<template>
  <!-- 选择数量提示信息 -->
  <el-text v-if="showLimitMessage" type="warning" size="small" class="limit-message">
    {{ limitMessage }}
  </el-text>
  <div class="imageMultiSelect">
    <div v-for="(item, index) in props.dataList" :key="index" class="image-block">
      <div class="title">{{ item.label }}</div>
      <el-text v-if="item.desc" size="small" class="desc">
        {{ item.desc }}
      </el-text>
      <el-image class="img" :src="getImageUrl(item.imageUrl)" fit="cover" />
      <div class="btn">
        <el-button
          :disabled="isDisabled(item)"
          v-if="!dataValue.includes(item.value)"
          @click="voting(item)"
          style="width: 100%"
          icon="Star"
          type="primary"
          >Voting / 为TA投票</el-button
        >
        <div class="btn_group" v-else>
          <el-button style="width: 60%" disabled icon="Star" type="primary"> 您已投票 </el-button>
          <el-button @click="cancelVoting(item)" style="width: 30%" type="danger">取消</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
import { delayTime } from "../../compConfig";
import { ElMessage } from "element-plus";

const compStore = useSelectCompStore();
const filePath = import.meta.env.VITE_APP_BASE_FILE;

interface Props {
  id: string;
  dataList: Array<any>;
  dataValue: Array<any>;
  layoutType: string;
  placeholder: string;
  isDev: boolean;
  isSelected: boolean;
  isPreviewRender?: boolean;
  minValue: number;
  maxValue: number;
}
const props = defineProps<Props>();
const dataValue = ref<Array<any>>([...props.dataValue]);

// 计算属性：当前选择数量
const currentCount = computed(() => dataValue.value.length);

// 计算属性：是否达到最小选择数量
// const isMinLimitReached = computed(() => currentCount.value <= props.minValue);

// 计算属性：是否达到最大选择数量
const isMaxLimitReached = computed(() => currentCount.value >= props.maxValue);

// 计算属性：是否显示限制提示
const showLimitMessage = computed(() => {
  return currentCount.value < props.minValue || currentCount.value > props.maxValue;
});

// 计算属性：限制提示信息
const limitMessage = computed(() => {
  if (currentCount.value < props.minValue) {
    return `请至少选择${props.minValue}项`;
  } else if (currentCount.value > props.maxValue) {
    return `最多只能选择${props.maxValue}项`;
  }
  return "";
});

// 计算属性：判断按钮是否应禁用
const isDisabled = (item: any) => {
  return (props.isDev && props.isSelected) || dataValue.value.includes(item.value) || isMaxLimitReached.value;
};

const defUrl = "/image/2025/09/01/640 (11).jpg";
const getImageUrl = (imgUrl: string) => {
  try {
    if (imgUrl != "") {
      return filePath + imgUrl;
    }
    return filePath + defUrl;
  } catch (e) {
    return filePath + defUrl;
  }
};

// 投票：添加item.value到数组
const voting = (item: any) => {
  // 检查是否已达到最大选择数量
  if (isMaxLimitReached.value) {
    ElMessage.warning(`最多只能选择${props.maxValue}项`);
    return;
  }
  // 检查是否已包含该值，避免重复添加
  if (!dataValue.value.includes(item.value)) {
    dataValue.value.push(item.value);
  }
};

// 取消投票：从数组中移除item.value
const cancelVoting = (item: any) => {
  // 检查是否已达到最小选择数量
  // if (isMinLimitReached.value) {
  //   ElMessage.warning(`请至少选择${props.minValue}项`);
  //   return;
  // }
  // 找到值在数组中的索引并移除
  const index = dataValue.value.indexOf(item.value);
  if (index !== -1) {
    dataValue.value.splice(index, 1);
  }
};

watch(
  () => dataValue.value,
  newValue => {
    setTimeout(() => {
      compStore.updateCurrentComp({
        dataValue: newValue,
        id: props.id
      });
    }, delayTime);
  },
  {
    deep: true // 因为是数组，需要深度监听
  }
);
</script>

<style lang="scss" scoped>
.limit-message {
  display: block;
  margin-bottom: 10px;
}
.imageMultiSelect {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.image-block {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: calc(50% - 8px);
  .title {
    min-height: 24px;
    margin-bottom: 2px;
  }
  .desc {
    align-self: first baseline !important;
    min-height: 20px;
    line-height: 24px;
  }
  .img {
    width: 100%;
    height: 280px;
  }
  .btn {
    margin-top: 10px;
    text-align: center;
  }
}
</style>
