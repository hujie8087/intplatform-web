<template>
  <el-input
    :disabled="isDev && isSelected"
    clearable
    v-model="dataValue"
    :placeholder="isDev && isSelected ? disableInputByDev : placeholder || '提示信息'"
  >
    <template #prefix>
      <img class="icon" :src="Email" alt="" />
    </template>
  </el-input>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import Email from "@/assets/images/form-editor/email.svg";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
import { disableInputByDev } from "../../compConfig";
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
<style lang="scss" scoped>
.icon {
  height: 18px;
}
</style>
