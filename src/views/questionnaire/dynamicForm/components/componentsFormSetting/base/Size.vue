<template>
  <div class="setting-item h-50">
    <el-text size="default">{{ $t("survey.form.commonComp.size") }}</el-text>
    <el-select size="default" v-model="comp.size" @change="handleChange" style="width: 120px">
      <el-option
        v-for="item in orientationList"
        :key="item.value"
        :label="$t(`survey.form.options.${item.label}`)"
        :value="item.value"
      />
    </el-select>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
import { textOrButtonSizeData } from "../settingConfigData";

const compStore = useSelectCompStore();
const orientationList = ref([...textOrButtonSizeData]);

const handleChange = (event: any) => {
  const data = event;
  compStore.updateCurrentComp({
    size: data,
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
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.comp {
  margin-top: 20px;
}
</style>
