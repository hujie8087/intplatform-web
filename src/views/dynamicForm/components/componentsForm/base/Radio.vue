<template>
  <el-radio-group
    v-model="dataValue"
    style="width: 100%"
    :style="layoutType === 'vertical' || isSelected ? radioVerticalStyle : radioStyle"
    :disabled="isDev"
    size="default"
  >
    <el-radio :key="_index" v-for="(item, _index) of props.dataList" :label="item" class="list-item">
      <div class="citem">
        <span class="editor-item">
          {{ item.label }}
        </span>
        <span class="other-val" v-if="item.subType === 'other'">
          <el-input size="default" :disabled="isDev" class="item-comp" v-model="item.value" placeholder="其他选项内容自定义" />
        </span>
        <span
          class="delete"
          v-if="props.dataList.length > 1 && !isPreviewRender"
          @click="deleteSubItem(_index)"
          :title="item.label"
        >
          <el-icon><Delete /></el-icon>
        </span>
      </div>
    </el-radio>
  </el-radio-group>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
interface Props {
  dataList: Array<any>;
  dataValue: string;
  layoutType: string;
  isDev: boolean;
  isSelected: boolean;
  isPreviewRender?: boolean;
}
const compStore = useSelectCompStore();
const props = defineProps<Props>();
const _updateKey = ref("");
const dataValue = ref(props.dataValue || null);

const radioVerticalStyle = ref({
  minHeight: "40px",
  lineHeight: "40px"
});

const radioStyle = ref({
  display: "flex",
  lineHeight: "40px"
});

const updateKey = () => {
  _updateKey.value = uuidv4();
};

const deleteSubItem = (index: number) => {
  const newDataList = [...props.dataList];
  newDataList.splice(index, 1);
  // 更新
  compStore.updateCurrentComp({
    ["dataList"]: newDataList
  });
  updateKey();
};
</script>

<style lang="scss" scoped>
::v-deep .el-radio-group {
  position: relative;
  width: 100% !important;
}
.editor-item {
  margin-left: 15px;
  outline: none;
}
::v-deep .el-radio__label {
  width: 100% !important;
}
.citem {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
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
.list-item {
  position: relative;
  width: 100%;
  .other-val {
    margin-left: 14px;
  }
}
</style>
