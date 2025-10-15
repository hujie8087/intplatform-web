<template>
  <div class="setting-item h-50">
    <el-text class="mx-1" size="default">{{ $t("survey.form.validateComp.format") }}</el-text>
    <el-select v-model="comp.formValidationFormat" style="width: 120px" size="default" class="abs-r" @change="handleChangeInput">
      <el-option :value="item.value" :label="item.label" :key="index" v-for="(item, index) in systemFormatList"></el-option>
    </el-select>
  </div>
  <div class="setting-item h-42" v-if="comp.formValidationFormat === 'regular'">
    <el-input
      size="default"
      v-model="comp.formValidationFormatRegex"
      :placeholder="$t('survey.form.validateComp.formatPlaceholder')"
      allow-clear
      clearable
      maxlength="40"
      :autosize="autosize"
      @input="changeValidationFormatRegexInput"
    />
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
const formList = [
  {
    label: "手机号",
    value: "phone"
  },
  {
    label: "数字",
    value: "number"
  },
  {
    label: "网站",
    value: "website"
  },
  {
    label: "身份证",
    value: "idCard"
  },
  {
    label: "邮件",
    value: "email"
  },
  {
    label: "自定义正则",
    value: "regular"
  }
];
const autosize = ref({
  minRows: 2,
  maxRows: 3
});
const systemFormatList = ref(formList);
interface Props {
  comp: any;
}

const props = defineProps<Props>();
const comp = ref(props.comp);

const compStore = useSelectCompStore();

const handleChangeInput = (event: any) => {
  const data = event;
  compStore.updateCurrentComp({
    formValidationFormat: data,
    id: props.comp.id
  });
};

const changeValidationFormatRegexInput = (value: any) => {
  const data = value;
  compStore.updateCurrentComp({
    formValidationFormatRegex: data,
    id: props.comp.id
  });
};
</script>
<style lang="scss" scoped>
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  color: rgb(0 0 0 / 45%);
}
</style>
