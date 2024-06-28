<template>
  <el-form>
    <el-form-item>
      <el-radio v-model="radioValue" :label="1"> 日，允许的通配符[, - * ? / L W] </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="2"> 不指定 </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="3">
        周期从
        <el-input-number v-model="cycle01" :min="1" :max="30" /> -
        <el-input-number v-model="cycle02" :min="cycle01 + 1" :max="31" /> 日
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="4">
        从
        <el-input-number v-model="average01" :min="1" :max="30" /> 号开始，每
        <el-input-number v-model="average02" :min="1" :max="31 - average01" /> 日执行一次
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="5">
        每月
        <el-input-number v-model="workday" :min="1" :max="31" /> 号最近的那个工作日
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="6"> 本月最后一天 </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="7" style="float: left; margin-right: 10px"> 指定 </el-radio>
      <el-select
        clearable
        v-model="checkboxList"
        placeholder="可多选"
        multiple
        :multiple-limit="10"
        style="float: left; width: 300px"
      >
        <el-option v-for="item in 31" :key="item" :label="item" :value="item" />
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
const workday = ref(1);
const checkboxList = ref<number[]>([]);
const checkCopy = ref([0]);

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
const workdayTotal = computed(() => {
  return workday.value + "L" || "";
});
watch(workday, newValue => {
  workday.value = props.check(newValue, 1, 31);
});

watch([cycle01, cycle02], ([newCycle01, newCycle02]) => {
  cycle01.value = props.check(newCycle01, 0, 30);
  cycle02.value = props.check(newCycle02, newCycle01 + 1, 31);
});

watch([average01, average02], ([newAverage01, newAverage02]) => {
  average01.value = props.check(newAverage01, 0, 30);
  average02.value = props.check(newAverage02, 1, 31 - newAverage01);
});
watch(
  () => props.cron.day,
  value => changeRadioValue(value)
);
watch([radioValue, cycleTotal, averageTotal, workdayTotal, checkboxString], () => onRadioChange());

const changeRadioValue = (value: string) => {
  if (value === "*") {
    radioValue.value = 1;
  } else if (value === "?") {
    radioValue.value = 2;
  } else if (value.indexOf("-") > -1) {
    const indexArr = value.split("-");
    cycle01.value = Number(indexArr[0]);
    cycle02.value = Number(indexArr[1]);
    radioValue.value = 3;
  } else if (value.indexOf("/") > -1) {
    const indexArr = value.split("/");
    average01.value = Number(indexArr[0]);
    average02.value = Number(indexArr[1]);
    radioValue.value = 4;
  } else if (value.indexOf("W") > -1) {
    const indexArr = value.split("W");
    workday.value = Number(indexArr[0]);
    radioValue.value = 5;
  } else if (value === "L") {
    radioValue.value = 6;
  } else {
    checkboxList.value = [...new Set(value.split(",").map(item => Number(item)))];
    radioValue.value = 7;
  }
};
const onRadioChange = () => {
  switch (radioValue.value) {
    case 1:
      localCron.value.day = "*";
      break;
    case 2:
      localCron.value.day = "?";
      break;
    case 3:
      localCron.value.day = cycleTotal.value;
      break;
    case 4:
      localCron.value.day = averageTotal.value;
      break;
    case 5:
      localCron.value.day = workdayTotal.value;
      break;
    case 6:
      localCron.value.day = "L";
      break;
    case 7:
      if (checkboxList.value.length === 0) {
        checkboxList.value.push(checkCopy.value[0]);
      } else {
        checkCopy.value = checkboxList.value;
      }
      localCron.value.day = checkboxString.value;
      break;
  }
};
</script>

<style scoped></style>
