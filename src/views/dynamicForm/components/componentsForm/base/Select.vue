<template>
  <el-select
    size="default"
    class="item-comp"
    v-model="_dataValue"
    :popper-append-to-body="false"
    style="width: 100%"
    :disabled="props.isDev && props.isSelected"
    :placeholder="
      props.isDev && props.isSelected ? (props.placeholder || '请选择') + ' - 编辑状态无法选则' : props.placeholder || '请选择'
    "
  >
    <el-option v-for="(item, _index) in props.dataList" :key="_index" :label="item.label" :value="item.value">
      <div class="flex items-center">
        <span style="float: left">{{ item.label }}</span>
        <span style="float: right" @click="delItem(_index)">
          <el-icon><DeleteFilled /></el-icon>
        </span>
      </div>
    </el-option>
  </el-select>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
const compStore = useSelectCompStore();
interface Props {
  dataList: Array<any>;
  dataValue: string;
  layoutType: string;
  placeholder: string;
  isDev: boolean;
  isSelected: boolean;
  isPreviewRender?: boolean;
}
const props = defineProps<Props>();
const _dataValue = ref(null);

const delItem = (index: number) => {
  const newDataList = [...props.dataList];
  newDataList.splice(index, 1);
  // 更新
  compStore.updateCurrentComp({
    ["dataList"]: newDataList
  });
};
</script>

<style lang="scss" scoped>
.item-comp {
  margin: 8px 0 20px;
}
.editor-item {
  margin-left: 15px;
  outline: none;
  &:active,
  &:focus {
    padding: 0 12px 0 10px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
  }
}
.list-item {
  position: relative;
  .delete {
    display: none;
  }
  &:hover,
  &:active,
  &:focus {
    .delete {
      position: absolute;
      top: 0;
      right: 0;
      display: block;
      cursor: pointer;
    }
  }
}
</style>
