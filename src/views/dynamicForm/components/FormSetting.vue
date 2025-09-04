<template>
  <div class="setting">
    <div class="comp-name">
      <div class="title-val">
        <img v-if="currCompIcon" :src="currCompIcon" class="compIcon" alt="" />
        <span v-if="!currCompIcon" class="compIcon">🍋</span>
        <span class="name"> {{ selectComp?.name || (selectComp?.type === "button" && "提交按钮") || "表单配置" }} </span>
      </div>
    </div>
    <div class="setting-base">
      <template v-if="currentCompId">
        <div class="category-name">基础设置</div>
        <div class="content m-b-0">
          <!--标题-->
          <FormTitle v-if="selectComp.type === 'formTitle'" :comp="selectComp" :key="selectComp._selectedId" />
          <!--图片-->
          <ImageUpload v-if="selectComp.type === 'img'" :comp="selectComp" :key="selectComp._selectedId"> </ImageUpload>
          <!-- 通用标题配置 -->
          <Title
            v-if="showParams('name') && !showParams('isLayoutComp') && displayTitleAndDesc"
            :comp="selectComp"
            :key="selectComp._selectedId"
          ></Title>
          <!-- 按钮 -->
          <ButtonText v-if="showParams('buttonText')" :comp="selectComp" :key="selectComp._selectedId" />
          <!-- 通用描述配置-->
          <Description
            v-if="showParams('description') && displayTitleAndDesc"
            :comp="selectComp"
            :key="selectComp._selectedId"
          ></Description>
          <!-- 通用Placeholder配置-->
          <Placeholder v-if="showParams('placeholder')" :comp="selectComp" :key="selectComp._selectedId"></Placeholder>
          <!-- 评分-->
          <RateConfig v-if="selectComp?.type === 'rate'" :comp="selectComp" />
          <!-- MPS取值范围 -->
          <NPSConfig v-if="['nps', 'SelectRate'].includes(selectComp?.type)" :comp="selectComp" />
          <!--分割线文字-->
          <DividerText v-if="showParams('dividerValue')" :comp="selectComp"></DividerText>
          <!--分割线类型-->
          <DividerBorderType v-if="showParams('dividerValue')" :comp="selectComp"></DividerBorderType>
          <!--位置-->
          <Position v-if="showParams('position')" :comp="selectComp" />

          <!--按钮大小-->
          <Size v-if="showParams('size')" :comp="selectComp" />
        </div>
        <div class="category-name" v-if="selectComp?.type && !JustShowCompType.includes(selectComp?.type)">表单验证</div>
        <div class="content">
          <!-- 数字区间 最大值最小值控制 -->
          <NumberConfig v-if="showParams('maxValue')" :comp="selectComp" />
          <!-- 必填 -->
          <Required v-if="showParams('isRequired')" :comp="selectComp" />
          <!-- 格式 -->
          <ValidationSystem v-if="showRegParams()" :comp="selectComp" />
          <!-- 自定义错误提示开关 -->
          <ValidationCustom v-if="showParams('isCustomErrorMessage')" :comp="selectComp" />
          <!-- 自定义错误信息 -->
          <CustomText v-if="selectComp?.isCustomErrorMessage" :comp="selectComp" />
        </div>
      </template>
      <div class="category-name">全局表单配置</div>
      <div class="content" v-if="selectForm">
        <DisplaySerialNumber :form="selectForm" />
        <DisplayDescription :form="selectForm" />
        <DisplayWaterMark :form="selectForm" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from "vue";
import _ from "lodash";
import Icon from "./compIcon";
import { CompListData, JustShowCompType } from "./compData";
import { hasOwnPropertyFunction, verifyRegularityCompList } from "./compConfig";
// 全局配置
import DisplayWaterMark from "./componentsFormSetting/global/DisplayWaterMark.vue";
import DisplayDescription from "./componentsFormSetting/global/DisplayDescription.vue";
import DisplaySerialNumber from "./componentsFormSetting/global/DisplaySerialNumber.vue";
// 基础配置
import Title from "./componentsFormSetting/base/Title.vue";
import Description from "./componentsFormSetting/base/Description.vue";
import Placeholder from "./componentsFormSetting/base/Placeholder.vue";
import ImageUpload from "./componentsFormSetting/base/ImageUpload.vue";
import RateConfig from "./componentsFormSetting/base/RateConfig.vue";
import NPSConfig from "./componentsFormSetting/base/NPSConfig.vue";
import DividerText from "./componentsFormSetting/base/DividerText.vue";
import DividerBorderType from "./componentsFormSetting/base/DividerBorderType.vue";
import Position from "./componentsFormSetting/base/Position.vue";
import Size from "./componentsFormSetting/base/Size.vue";
import ButtonText from "./componentsFormSetting/base/ButtonText.vue";
// 校验配置
import NumberConfig from "./componentsFormSetting/validation/NumberConfig.vue";
import Required from "./componentsFormSetting/validation/Required.vue";
import ValidationCustom from "./componentsFormSetting/validation/ValidationCustom.vue";
import ValidationSystem from "./componentsFormSetting/validation/ValidationFormat.vue";
import CustomText from "./componentsFormSetting/validation/CustomText.vue";
// 独立配置
import FormTitle from "./componentsFormSetting/show/FormTitle.vue";

interface Props {
  selectComp: any;
  selectForm: any;
  currentCompId: string;
}

const props = defineProps<Props>();
const selectComp = reactive(props.selectComp);
const selectForm = reactive(props.selectForm);
// 是否展示标题和描述设置
const displayTitleAndDesc = computed(() => !["formTitle", "img", "button"].includes(selectComp?.type));

const currCompIcon = computed(() => {
  let _list: any[] = [];
  CompListData.map(item => {
    _list = [..._list, ...item.children];
  });
  const comp = _.filter(_list, {
    type: selectComp?.type
  })?.[0]?.icon;

  return comp || (selectComp?.type === "button" && Icon.Button);
});

const showParams = (params: string) => {
  const bool = hasOwnPropertyFunction(selectComp, params);
  return bool;
};

const showRegParams = () => {
  const compList = verifyRegularityCompList();
  return compList.includes(selectComp?.type);
};

watch([() => props.selectComp, () => props.selectForm], ([newValue, newFormConfig]) => {
  if (!selectComp) {
    return;
  }
  selectComp.value = newValue;
  selectForm.value = newFormConfig;
});
</script>

<style lang="scss">
.comp-name {
  position: sticky;
  top: 0;
  z-index: 10;
  height: 60px;
  padding: 0 10px 0 15px;
  background: #ffffff;
  border-bottom: 1px solid rgb(0 0 0 / 6%);
  .title-val {
    display: flex;
    align-items: center;
    height: 100%;
  }
  .compIcon {
    width: 18px;
  }
  .name {
    padding: 0 8px;
    color: rgb(0 0 0 / 65%);
  }
}
.setting {
  max-height: 100%;
  overflow-y: auto;
  background: #fafafa;
}
.setting-base {
  padding: 5px 15px;
  overflow-x: hidden;
}
.category-name {
  height: 56px;
  font-size: 14px;
  font-weight: 700;
  line-height: 56px;
  color: rgb(0 0 0 / 65%);
  &::before {
    width: 100px;
    height: 10px;
    padding-left: 8px;
    content: "";
    border-left: 3px solid #1677ff;
  }
}
.border-top {
  margin-top: 20px;
  border-top: 1px solid rgb(0 0 0 / 6.5%);
}
.block-title {
  display: block;
  padding-bottom: 8px;
}
.setting-item {
  position: relative;
  .ant-select {
    top: 10px;
  }
}
.h-80 {
  height: 80px;
  line-height: 80px;
}
.h-50 {
  height: 50px;
  line-height: 50px;
}
.h-42 {
  height: 42px;
  line-height: 42px;
}
.p-t-10 {
  padding-top: 6px;
}
.abs-r {
  position: absolute;
  right: 0;
}
.switch-r {
  top: -5px;
}
.content {
  display: block;
  margin-bottom: 18px;
  &.m-b-0 {
    margin-bottom: 0;
  }
}
</style>
