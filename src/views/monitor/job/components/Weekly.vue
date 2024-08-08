<template>
  <el-form>
    <el-form-item>
      <el-radio v-model="radioValue" :label="1"> 周，允许的通配符[, - * ? / L #] </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="2"> 不指定 </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="3">
        周期从
        <el-select clearable v-model="cycle01">
          <el-option
            v-for="(item, index) of weekList"
            :key="index"
            :label="item.value"
            :value="item.key"
            :disabled="item.key === 7"
          >
            {{ item.value }}
          </el-option>
        </el-select>
        -
        <el-select clearable v-model="cycle02">
          <el-option
            v-for="(item, index) of weekList"
            :key="index"
            :label="item.value"
            :value="item.key"
            :disabled="item.key <= cycle01"
          >
            {{ item.value }}
          </el-option>
        </el-select>
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="4">
        第
        <el-input-number v-model="average01" :min="1" :max="4" /> 周的
        <el-select clearable v-model="average02">
          <el-option v-for="item in weekList" :key="item.key" :label="item.value" :value="item.key" />
        </el-select>
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="5">
        本月最后一个
        <el-select clearable v-model="weekday">
          <el-option v-for="item in weekList" :key="item.key" :label="item.value" :value="item.key" />
        </el-select>
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="6" style="float: left; margin-right: 10px"> 指定 </el-radio>
      <el-select
        clearable
        v-model="checkboxList"
        placeholder="可多选"
        multiple
        :multiple-limit="8"
        style="float: left; width: 300px"
      >
        <el-option v-for="item in weekList" :key="item.key" :label="item.value" :value="item.key" />
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
const weekday = ref(2);
const weekList = ref([
  { key: 1, value: "星期日" },
  { key: 2, value: "星期一" },
  { key: 3, value: "星期二" },
  { key: 4, value: "星期三" },
  { key: 5, value: "星期四" },
  { key: 6, value: "星期五" },
  { key: 7, value: "星期六" }
]);

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
const weekdayTotal = computed(() => {
  return weekday.value + "L" || "";
});
watch(weekday, newValue => {
  weekday.value = props.check(newValue, 1, 31);
});

watch([cycle01, cycle02], ([newCycle01, newCycle02]) => {
  cycle01.value = props.check(newCycle01, 0, 11);
  cycle02.value = props.check(newCycle02, newCycle01 + 1, 12);
});

watch([average01, average02], ([newAverage01, newAverage02]) => {
  average01.value = props.check(newAverage01, 0, 11);
  average02.value = props.check(newAverage02, 1, 12 - newAverage01);
});
watch(
  () => props.cron.month,
  value => changeRadioValue(value)
);
watch([radioValue, cycleTotal, averageTotal, weekdayTotal, checkboxString], () => onRadioChange());

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
  } else if (value.indexOf("#") > -1) {
    const indexArr = value.split("#");
    average01.value = Number(indexArr[1]);
    average02.value = Number(indexArr[0]);
    radioValue.value = 4;
  } else if (value.indexOf("L") > -1) {
    const indexArr = value.split("L");
    weekday.value = Number(indexArr[0]);
    radioValue.value = 5;
  } else {
    checkboxList.value = [...new Set(value.split(",").map(item => Number(item)))];
    radioValue.value = 6;
  }
};
const onRadioChange = () => {
  if (radioValue.value === 2 && props.cron.day === "?") {
    localCron.value.day = "*";
  }
  if (radioValue.value !== 2 && props.cron.day !== "?") {
    localCron.value.day = "?";
  }
  switch (radioValue.value) {
    case 1:
      localCron.value.week = "*";
      break;
    case 2:
      localCron.value.week = "?";
      break;
    case 3:
      localCron.value.week = cycleTotal.value;
      break;
    case 4:
      localCron.value.week = averageTotal.value;
      break;
    case 5:
      localCron.value.week = weekdayTotal.value;
      break;
    case 6:
      if (checkboxList.value.length === 0) {
        checkboxList.value.push(checkCopy.value[0]);
      } else {
        checkCopy.value = checkboxList.value;
      }
      localCron.value.week = checkboxString.value;
      break;
  }
};
</script>

<style scoped></style>
