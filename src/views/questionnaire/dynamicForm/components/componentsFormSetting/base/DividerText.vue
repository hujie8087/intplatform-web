<template>
  <el-text size="default">{{ $t("survey.form.dividerComp.dividerText") }}</el-text>
  <el-input
    size="default"
    class="comp"
    v-if="compStore.currentCompConfig"
    :placeholder="$t('main.inputPlaceholder')"
    clearable
    v-model="comp.dividerValue"
    @input="handleChangeInput"
    maxlength="15"
    show-word-limit
  ></el-input>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";

const compStore = useSelectCompStore();
const handleChangeInput = (event: any) => {
  const data = event;
  compStore.updateCurrentComp({
    dividerValue: data,
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
  margin-top: 10px;
  color: yellowgreen;
}
</style>
