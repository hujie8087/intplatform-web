<template>
  <el-input :disabled="isDev" size="default" clearable v-model="dataValue" :placeholder="placeholder">
    <template #prefix>
      <img class="icon" :src="Phone" alt="" />
    </template>
  </el-input>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import Phone from "@/assets/images/form-editor/phone.svg";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
const compStore = useSelectCompStore();
interface Props {
  id: string;
  placeholder: string;
  dataValue: string;
  isDev: boolean;
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
