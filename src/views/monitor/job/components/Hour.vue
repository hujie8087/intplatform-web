<template>
  <el-form>
    <el-form-item>
      <el-radio v-model="radioValue" :label="1"> 小时，允许的通配符[, - * /] </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="2">
        周期从
        <el-input-number v-model="cycle01" :min="0" :max="22" /> -
        <el-input-number v-model="cycle02" :min="cycle01 + 1" :max="23" /> 时
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="3">
        从
        <el-input-number v-model="average01" :min="0" :max="22" /> 时开始，每
        <el-input-number v-model="average02" :min="1" :max="23 - average01" /> 小时执行一次
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="4" style="float: left; margin-right: 10px"> 指定 </el-radio>
      <el-select
        clearable
        v-model="checkboxList"
        placeholder="可多选"
        multiple
        :multiple-limit="10"
        style="float: left; width: 300px"
      >
        <el-option v-for="item in 24" :key="item" :label="item - 1" :value="item - 1" />
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
  cycle01.value = props.check(newCycle01, 0, 58);
  cycle02.value = props.check(newCycle02, newCycle01 + 1, 59);
});

watch([average01, average02], ([newAverage01, newAverage02]) => {
  average01.value = props.check(newAverage01, 0, 58);
  average02.value = props.check(newAverage02, 1, 59 - newAverage01);
});
watch(
  () => props.cron.hour,
  value => changeRadioValue(value)
);
watch([radioValue, cycleTotal, averageTotal, checkboxString], () => onRadioChange());

const changeRadioValue = (value: string) => {
  if (value === "?") {
    radioValue.value = 1;
  } else if (value.includes("-")) {
    const [start, end] = value.split("-");
    cycle01.value = Number(start);
    cycle02.value = Number(end);
    radioValue.value = 2;
  } else if (value.includes("/")) {
    const [start, end] = value.split("/");
    average01.value = Number(start);
    average02.value = Number(end);
    radioValue.value = 3;
  } else if (value.includes(",")) {
    checkboxList.value = value.split(",").map(item => Number(item));
    radioValue.value = 4;
  }
};
const onRadioChange = () => {
  switch (radioValue.value) {
    case 1:
      localCron.value.hour = "*";
      break;
    case 2:
      localCron.value.hour = cycleTotal.value;
      break;
    case 3:
      localCron.value.hour = averageTotal.value;
      break;
    case 4:
      if (checkboxList.value.length === 0) {
        checkboxList.value.push(checkCopy.value[0]);
      } else {
        checkCopy.value = checkboxList.value;
      }
      localCron.value.hour = checkboxString.value;
      break;
  }
};
</script>

<style scoped></style>
