<template>
  <el-date-picker
    type="date"
    style="width: 100%"
    :disabled="isDev && isSelected"
    v-model="dataValue"
    :placeholder="isDev && isSelected ? disableInputByDev : placeholder || '提示信息'"
    value-format="YYYY-MM-DD"
    @focus="handleDateClick"
  />
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { disableInputByDev, delayTime } from "../../compConfig";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";

const compStore = useSelectCompStore();
interface Props {
  id: string;
  placeholder: string;
  dataValue: string;
  isDev: boolean;
  isSelected: boolean;
}
const props = defineProps<Props>();
const dataValue = ref(props.dataValue || null);

const emit = defineEmits(["triggerSelect"]); // 定义触发选中的事件
const handleDateClick = () => {
  emit("triggerSelect"); // 传递组件信息给父级
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
<style lang="scss"></style>
