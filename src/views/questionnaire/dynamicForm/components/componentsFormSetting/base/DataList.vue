<template>
  <div class="setting-item">
    <div style="margin-bottom: 10px">
      <el-text size="default">选项排序</el-text>
    </div>
    <draggable
      v-if="comp.dataList.length"
      class="flex flex-col gap-2 p-4 w-300px bg-gray-500/5 rounded compList"
      :list="comp.dataList"
      :animation="150"
      :sort="true"
      ghost-class="ghost"
      handle=".handle"
      item-key="id"
    >
      <!-- 使用item插槽来定义可拖拽项 -->
      <template #item="{ element, index }">
        <div
          :key="element.id || index"
          :class="{
            'cursor-move': true,
            'form-item': true
          }"
        >
          <div class="active-drag handle">
            <img src="/src/assets/images/form-editor/drag.svg" alt="" />
            <span class="label">
              {{ element?.value }}
            </span>
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import draggable from "vuedraggable";

interface Props {
  comp: any;
}
const props = defineProps<Props>();
const comp = ref(props.comp);
const dataList = ref(props);
watch(
  () => props.comp.dataList,
  (newValue: any) => {
    dataList.value = newValue;
  }
);
</script>

<style lang="scss" scoped>
.handle {
  display: flex;
  height: 36px;
  img {
    width: 12px;
    cursor: move;
  }
}
.label {
  display: inline-block;
  width: 200px;
  margin-left: 10px;
  overflow: hidden; /* 隐藏超出部分 */
  font-size: 14px;
  color: #666666;
  text-overflow: ellipsis;
  white-space: nowrap; /* 强制文本在一行显示 */
  user-select: none;
}
.secondary {
  display: block;
  padding-bottom: 8px;
}
.form-item {
  height: 36px;
  line-height: 36px;
  img {
    margin-top: 0;
  }
}
</style>
