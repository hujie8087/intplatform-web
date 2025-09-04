<template>
  <el-date-picker
    type="date"
    style="width: 100%"
    :disabled="props.isDev"
    v-model="dataValue"
    :placeholder="placeholder"
    value-format="YYYY-MM-DD"
    size="default"
  />
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
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
<style lang="scss"></style>
