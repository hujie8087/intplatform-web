<template>
  <el-form>
    <el-form-item>
      <el-radio :label="1" v-model="radioValue"> 不填，允许的通配符[, - * /] </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio :label="2" v-model="radioValue"> 每年 </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio :label="3" v-model="radioValue">
        周期从
        <el-input-number v-model="cycle01" :min="fullYear" :max="2098" /> -
        <el-input-number v-model="cycle02" :min="cycle01 ? cycle01 + 1 : fullYear + 1" :max="2099" />
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio :label="4" v-model="radioValue">
        从
        <el-input-number v-model="average01" :min="fullYear" :max="2098" /> 年开始，每
        <el-input-number v-model="average02" :min="1" :max="2099 - average01 || fullYear" /> 年执行一次
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="5" style="float: left; margin-right: 10px"> 指定 </el-radio>
      <el-select
        clearable
        v-model="checkboxList"
        placeholder="可多选"
        multiple
        :multiple-limit="8"
        style="float: left; width: 300px"
      >
        <el-option v-for="item in 9" :key="item" :value="item - 1 + fullYear" :label="item - 1 + fullYear" />
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { computed } from "vue";
import { ref } from "vue";
import { CrontabValue } from "./CrontabDialog.vue";

const props = defineProps<{
  cron: CrontabValue;
  check: (value: number, min: number, max: number) => number;
}>();

const radioValue = ref<number>(1);
const cycle01 = ref<number>(0);
const cycle02 = ref<number>(1);
const average01 = ref<number>(0);
const average02 = ref<number>(1);
const checkboxList = ref<number[]>([]);
const checkCopy = ref([0]);
const fullYear = ref(0);
const maxFullYear = ref(0);

// Initialize local state from props.cron if necessary
const localCron = ref(props.cron);

const cycleTotal = computed(() => {
  return cycle01.value + "-" + cycle02.value;
});

const averageTotal = computed(() => {
  return average01.value + "/" + average02.value;
});

const checkboxString = computed(() => {
  return checkboxList.value.join(",");
});

watch([cycle01, cycle02], ([newCycle01, newCycle02]) => {
  cycle01.value = props.check(newCycle01, fullYear.value, maxFullYear.value - 1);
  cycle02.value = props.check(newCycle02, newCycle01 + 1, 12);
});

watch([average01, average02], ([newAverage01, newAverage02]) => {
  average01.value = props.check(newAverage01, fullYear.value, maxFullYear.value - 1);
  average02.value = props.check(newAverage02, 1, 10);
});
watch(
  () => props.cron.year,
  value => changeRadioValue(value)
);
watch([radioValue, cycleTotal, averageTotal, checkboxString], () => onRadioChange());

const changeRadioValue = (value: string) => {
  if (value === "") {
    radioValue.value = 1;
  } else if (value === "*") {
    radioValue.value = 2;
  } else if (value.indexOf("-") > -1) {
    const indexArr = value.split("-");
    cycle01.value = Number(indexArr[0]);
    cycle02.value = Number(indexArr[1]);
    radioValue.value = 3;
  } else if (value.indexOf("/") > -1) {
    const indexArr = value.split("/");
    average01.value = Number(indexArr[1]);
    average02.value = Number(indexArr[0]);
    radioValue.value = 4;
  } else {
    checkboxList.value = [...new Set(value.split(",").map(item => Number(item)))];
    radioValue.value = 5;
  }
};
const onRadioChange = () => {
  switch (radioValue.value) {
    case 1:
      localCron.value.year = "";
      break;
    case 2:
      localCron.value.year = "*";
      break;
    case 3:
      localCron.value.year = cycleTotal.value;
      break;
    case 4:
      localCron.value.year = averageTotal.value;
      break;
    case 5:
      if (checkboxList.value.length === 0) {
        checkboxList.value.push(checkCopy.value[0]);
      } else {
        checkCopy.value = checkboxList.value;
      }
      localCron.value.year = checkboxString.value;
      break;
  }
};
</script>

<style scoped></style>
