<template>
  <el-checkbox-group
    size="default"
    v-model="localDataValue"
    :disabled="isDev"
    :style="layoutType === 'vertical' || isSelected ? radioVerticalStyle : radioStyle"
    :class="{
      'group-item': true,
      'group-item-select': isSelected
    }"
    :key="isSelected + _updateKey"
  >
    <el-checkbox v-for="(item, _index) in props.dataList" :key="_index" :label="item.value" :disabled="isDev">
      <div class="citem">
        <span class="editor-item">
          {{ item.label }}
        </span>
        <span class="other-val" v-if="item.subType === 'other'">
          <el-input size="default" :disabled="isDev" class="item-comp" v-model="item.value" placeholder="待填表者更新" />
        </span>
      </div>
    </el-checkbox>
  </el-checkbox-group>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
const compStore = useSelectCompStore();
interface Props {
  dataList: Array<any>;
  dataValue: string;
  layoutType: string;
  isDev: boolean;
  isSelected: boolean;
  isPreviewRender?: boolean;
}
const _updateKey = ref("");
const props = defineProps<Props>();
const localDataValue = ref([]);

// 1. 使用watch监听（推荐，可获取新旧值）
watch(
  () => localDataValue.value,
  newValue => {
    compStore.updateCurrentComp({
      dataValue: newValue
    });
  },
  {
    deep: true // 因为是数组，需要深度监听
  }
);

const radioVerticalStyle = ref({
  minHeight: "40px",
  lineHeight: "40px"
});

const radioStyle = ref({
  display: "flex",
  lineHeight: "40px"
});
</script>

<style lang="scss" scoped>
:deep {
  .el-checkbox {
    position: relative;
    width: 100%;
    min-height: 40px;
    line-height: 40px;
    .el-checkbox__input {
      position: absolute;
      top: 12px;
    }
    .el-checkbox__label {
      width: calc(100% - 40px); /* 防止内容溢出 */
      height: 100%;
      margin-left: 24px; /* 为复选框留出空间 */
      line-height: 40px;
    }
  }
}
.other-val {
  display: block;
  margin-left: 24px; /* 与复选框对齐 */
}
.citem {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: calc(100%);
  .delete {
    display: none;
  }
  &:hover,
  &:active,
  &:focus {
    .delete {
      display: block;
      float: right;
      margin-left: auto;
      cursor: pointer;
    }
  }
}
.editor-item {
  margin-left: 0; /* 已通过label的margin控制整体偏移 */
  outline: none;
}

/* 禁用状态下的文本颜色 */
:deep(.el-checkbox.is-disabled .el-checkbox__label) {
  color: #000000 !important;
}

/* 复选框输入框显示 */
:deep(.el-checkbox__input .el-checkbox__inner) {
  display: inline-block;
}
</style>
