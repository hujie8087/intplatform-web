<template>
  <div class="setting-item h-42">
    <el-text class="mx-1" size="default">显示标题图片</el-text>
    <el-switch v-model="comp.titleImageShow" size="default" @change="changeValue($event, 'titleImageShow')" />
  </div>
  <el-text class="mx-1" size="default">标题图片</el-text>
  <el-input
    size="default"
    class="mb-10"
    placeholder="请输入图片URL"
    v-model="comp.titleImageUrl"
    @input="handleChangeInput($event, 'titleImageUrl')"
    :maxlength="400"
  ></el-input>
  <el-text class="mx-1" size="default">表单标题</el-text>
  <el-input
    size="default"
    class="mb-10"
    placeholder="请输入标题文字（最多30个字）"
    v-model="comp.titleValue"
    @input="handleChangeInput"
    :maxlength="30"
  ></el-input>
  <div class="setting-item h-50">
    <el-text class="mx-1" size="default">标题大小</el-text>
    <el-select
      size="default"
      clearable
      v-model="comp.titleSize"
      style="width: 120px"
      class="abs-r"
      @change="changeSelect($event, 'titleSize')"
    >
      <el-option :value="item.value" :label="item.label" v-for="(item, index) in orientationList" :key="index" />
    </el-select>
  </div>
  <div class="setting-item h-42">
    <el-text class="mx-1" size="default">显示标题描述</el-text>
    <el-switch v-model="comp.titleDescriptionShow" size="default" @change="changeValue($event, 'titleDescriptionShow')" />
  </div>
  <el-text class="mx-1" size="default">标题描述</el-text>
  <el-input
    class="mb-10 m-b-10"
    placeholder="请输入描述"
    size="default"
    v-model="comp.titleDescription"
    :autosize="{ minRows: 3, maxRows: 5 }"
    type="textarea"
    show-word-limit
    @input="handleChangeInput($event, 'titleDescription')"
    :maxlength="200"
  />
  <div class="setting-item h-50">
    <el-text class="mx-1" size="default">位置(标题+描述)</el-text>
    <el-select
      size="default"
      v-model="comp.titleDescriptionPosition"
      style="width: 120px"
      class="abs-r"
      @change="changeSelect($event, 'titleDescriptionPosition')"
    >
      <el-option :value="item.value" :label="item.label" v-for="(item, index) in positionList" :key="index" />
    </el-select>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
import { optionData, textOrButtonSizeData } from "../settingConfigData";

const orientationList = ref([...textOrButtonSizeData]);
const positionList = ref([...optionData]);
interface Props {
  comp: any;
}
const compStore: any = useSelectCompStore();
const changeValue = (event: any, param?: string) => {
  const data = event;
  compStore.updateCurrentComp({
    [param || "buttonIconShowBool"]: data
  });
};

const handleChangeInput = (value: any, params?: string) => {
  const data = value;
  compStore.updateCurrentComp({
    [params || "titleValue"]: data
  });
};

const changeSelect = (value: any, param?: string) => {
  const data = value;
  compStore.updateCurrentComp({
    [param || "titleSize"]: data
  });
};

const props = defineProps<Props>();
const comp = ref(props.comp || null);
</script>

<style lang="scss" scoped>
.comp {
  padding: 10px;
  color: yellowgreen;
}
.mb-10 {
  margin-top: 8px;
  margin-bottom: 8px;
}
.h-42 {
  height: 42px;
  line-height: 42px;
}
.m-b-10 {
  margin-bottom: 20px;
}
.setting-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
</style>
