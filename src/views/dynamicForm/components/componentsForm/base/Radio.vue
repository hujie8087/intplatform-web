<template>
  <el-radio-group
    v-model="dataValue"
    :style="layoutType === 'vertical' || isSelected ? radioVerticalStyle : radioStyle"
    :disabled="isDev"
    size="default"
  >
    <el-radio :key="_index" v-for="(item, _index) of dataList" :label="item" class="list-item">
      <span class="editor-item">
        {{ item.label }}
      </span>
      <span class="other-val" v-if="item.subType === 'other'">
        <el-input size="default" :disabled="isDev" class="item-comp" v-model="item.value" placeholder="其他选项内容自定义" />
      </span>
      <span class="delete" v-if="dataList.length > 1 && !isPreviewRender" @click="deleteSubItem(_index)" :title="item.label">
        <el-icon><Close /></el-icon>
      </span>
    </el-radio>
  </el-radio-group>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";
interface Props {
  dataList: Array<any>;
  dataValue: string;
  layoutType: string;
  isDev: boolean;
  isSelected: boolean;
  isPreviewRender?: boolean;
}
const props = defineProps<Props>();
const _updateKey = ref("");
const dataValue = ref(props.dataValue || null);
const dataList = ref(props.dataList || []);

const radioVerticalStyle = ref({
  display: "flex",
  lineHeight: "40px",
  flexDirection: "column",
  alignItems: "baseline"
});

const radioStyle = ref({
  height: "40px",
  lineHeight: "40px"
});

const updateKey = () => {
  _updateKey.value = uuidv4();
};

const deleteSubItem = (index: number) => {
  dataList.value.splice(index, 1);
  console.log(index, "index");
  updateKey();
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-radio-group {
    .el-radio {
      position: absolute;
      top: 12px;
    }
  }
}
.editor-item {
  margin-left: 15px;
  outline: none;
}
::v-deep(:where(.css-dev-only-do-not-override-17yhhjv).el-radio-group) {
  display: block;
  width: 100%;
}
::v-deep(:where(.css-dev-only-do-not-override-17yhhjv).el-radio-wrapper span.el-radio + *) {
  color: #000000;
}
::v-deep(:where(.css-dev-only-do-not-override-17yhhjv).el-radio-wrapper .el-radio-input) {
  display: inline;
}
.list-item {
  position: relative;
  width: 100%;
  .other-val {
    margin-left: 40px;
  }
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
