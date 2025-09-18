<template>
  <div>
    <el-time-picker
      class="item-comp"
      style="width: 100%"
      :disabled="isDev && isSelected"
      v-model="dataValue"
      type="date"
      :placeholder="isDev && isSelected ? disableInputByDev : placeholder || '提示信息'"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { disableInputByDev } from "../../compConfig";
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
watch(
  () => dataValue.value,
  newValue => {
    compStore.updateCurrentComp({
      dataValue: newValue
    });
  }
);
</script>
<style lang="scss"></style>
