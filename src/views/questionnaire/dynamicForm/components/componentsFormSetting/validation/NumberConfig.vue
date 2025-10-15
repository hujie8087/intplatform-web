<template>
  <div class="setting-item h-42">
    <el-text size="default">{{ $t("survey.form.validateComp.minVal") }}</el-text>
    <el-input-number
      class="input_number"
      size="default"
      style="width: 100px"
      controls-position="right"
      :placeholder="$t('main.inputPlaceholder')"
      clearable
      v-model="comp.minValue"
      @change="handleChangeInput($event, 'minValue')"
    />
  </div>

  <div class="setting-item h-42">
    <el-text size="default">{{ $t("survey.form.validateComp.maxVal") }}</el-text>
    <el-input-number
      size="default"
      class="input_number"
      style="width: 100px"
      controls-position="right"
      clearable
      :placeholder="$t('main.inputPlaceholder')"
      v-model="comp.maxValue"
      @change="handleChangeInput($event, 'maxValue')"
    />
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";

interface Props {
  comp: any;
}
const compStore = useSelectCompStore();
const props = defineProps<Props>();
const comp = ref(props.comp);
const handleChangeInput = (event: any, param: "maxValue" | "minValue") => {
  const data = event;
  compStore.updateCurrentComp({
    [param]: data,
    id: props.comp.id
  });
};
</script>
<style lang="scss" scoped>
.setting-item {
  .input_number {
    float: right;
  }
}
</style>
