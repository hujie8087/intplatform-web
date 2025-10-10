<template>
  <el-text size="default" class="block-title">{{ $t("survey.form.commonComp.inputPlaceholder") }}</el-text>
  <el-input
    class="mb-10"
    v-if="compStore.currentCompConfig"
    size="default"
    v-model="comp.placeholder"
    :placeholder="$t('main.inputPlaceholder')"
    @input="handleChangeInput"
    clearable
  />
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
const compStore: any = useSelectCompStore();
const handleChangeInput = (value: any) => {
  const data = value;
  compStore.updateCurrentComp({
    placeholder: data,
    id: props.comp.id
  });
};
interface Props {
  comp: any;
}
const props = defineProps<Props>();
const comp = ref(props.comp);
</script>
<style lang="scss" scoped>
.comp {
  padding: 10px;
  color: yellowgreen;
}
.mb-10 {
  margin-bottom: 10px;
}
</style>
