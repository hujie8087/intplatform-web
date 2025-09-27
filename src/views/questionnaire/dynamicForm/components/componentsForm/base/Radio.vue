<template>
  <el-radio-group
    v-model="dataValue"
    style="width: 100%"
    :style="layoutType === 'vertical' || isSelected ? radioVerticalStyle : radioStyle"
    :disabled="isDev && isSelected"
    @change="inputBlur"
  >
    <el-radio :key="_index" v-for="(item, _index) of props.dataList" :label="item.value" class="list-item">
      <div class="citem">
        <span class="editor-item">
          {{ item.label }}
        </span>
        <span class="other-val" v-if="item.subType === 'other'">
          <el-input :disabled="isDev" class="item-comp" v-model="item.value" placeholder="待填表者更新" />
        </span>
      </div>
    </el-radio>
  </el-radio-group>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
import { delayTime } from "../../compConfig";

const compStore = useSelectCompStore();

interface Props {
  id: string;
  dataList: Array<any>;
  dataValue: string;
  layoutType: string;
  isDev: boolean;
  isSelected: boolean;
  isPreviewRender?: boolean;
  isRequired: boolean;
  customErrorMessage: string;
}

const props = defineProps<Props>();
const dataValue = ref(props.dataValue || null);
const radioVerticalStyle = ref({
  minHeight: "40px",
  lineHeight: "40px"
});

const radioStyle = ref({
  display: "flex",
  lineHeight: "40px"
});

watch(
  () => dataValue.value,
  newValue => {
    // 清除已存在的错误提示（有输入就去掉红框）
    const curError = compStore?.currentCompConfig?.errorMsg;
    if (curError) {
      compStore.updateCurrentComp({ errorMsg: "", id: props.id });
    }
    setTimeout(() => {
      compStore.updateCurrentComp({
        dataValue: newValue,
        id: props.id
      });
    }, delayTime);
  }
);
const inputBlur = () => {
  if (!props.isRequired) return false;
  if (!dataValue.value) {
    let msg = props.customErrorMessage ? props.customErrorMessage : "此数据不能为空";
    compStore.updateCurrentComp({ errorMsg: msg, id: props.id });
  }
};
</script>

<style lang="scss" scoped>
:deep(.el-radio-group) {
  position: relative;
  width: 100% !important;
}
.editor-item {
  margin-left: 15px;
  outline: none;
}
:deep(.el-radio__label) {
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
