<template>
  <el-select
    class="item-comp"
    v-model="dataValue"
    :popper-append-to-body="false"
    style="width: 100%"
    :disabled="props.isDev && props.isSelected"
    @focus="handleFocus"
    :placeholder="
      props.isDev && props.isSelected ? (props.placeholder || '请选择') + ' - 编辑状态无法选择' : props.placeholder || '请选择'
    "
  >
    <el-option v-for="(item, _index) in props.dataList" :key="_index" :label="item.label" :value="item.value">
      <div class="flex items-center">
        <span style="float: left">{{ item.label }}</span>
      </div>
    </el-option>
  </el-select>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
import { delayTime } from "../../compConfig";
const emit = defineEmits(["compFocus"]);
const compStore = useSelectCompStore();
interface Props {
  id: string;
  dataList: Array<any>;
  dataValue: string;
  layoutType: string;
  placeholder: string;
  isDev: boolean;
  isSelected: boolean;
  isPreviewRender?: boolean;
}
const props = defineProps<Props>();
const dataValue = ref(props.dataValue);
const handleFocus = () => {
  emit("compFocus");
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
  }
);
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
