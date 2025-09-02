<template>
  <div class="comp-item">
    <div class="comp-item-title" v-if="!!displaySection">
      <el-text class="title-value" size="large">
        <span
          class="number"
          :class="{ 'title-value-isRequired': component.isRequired, number: true }"
          v-if="formConfig?.displayNumberSort"
        >
          {{ component?.lineNumber }}.
        </span>
        <span class="title-value">
          <el-input
            v-if="isDev && component?.id === selectedComp?.id"
            size="default"
            v-model="localComponent.title"
            :autosize="{ minRows: 1, maxRows: 1 }"
            maxlength="50"
            type="textarea"
            :placeholder="'请输入标题'"
            @input="changeValue($event, 'title')"
            clearable
          />
          <div v-else class="description input-comp">
            {{ component.title }}
          </div>
        </span>
      </el-text>
    </div>
    <div class="comp-item-description" v-if="displaySection && formConfig?.displayDescription">
      <div type="secondary" v-if="(component?.id !== selectedComp?.id && isDev) || renderType">
        <div class="description">{{ component.description }}</div>
      </div>
      <el-input
        v-else
        size="default"
        type="textarea"
        class="desc_input"
        :autosize="{ minRows: 1, maxRows: 5 }"
        v-model="localComponent.description"
        :placeholder="'请输入描述'"
        @input="changeValue($event, 'description')"
        clearable
      >
      </el-input>
    </div>
    <div class="component">
      <component
        :key="currentComp"
        :is-selected="component?.id === selectedComp?.id"
        v-bind="component"
        :is="currentComp.comp"
      ></component>
    </div>
    <div class="active-comp-setting" v-if="compConfig.id === selectedComp?.id && !isIgnoreEditor()">
      <div class="bottom-setting">
        <div class="data-list-setting" v-if="HasSettingTypeList.includes(compConfig.type)">
          <div class="add-item">
            <div class="item" @click="addItem('new')">
              <el-icon :style="{ fontSize: '16px', color: '#646a73' }"><Plus /></el-icon>
              <span>添加单项</span>
            </div>

            <div class="item" :class="{ disabled: checkAddOtherClass() }" @click="!checkAddOtherClass() && addItem('other')">
              <el-icon :style="{ fontSize: '16px', color: '#646a73' }"><Plus /></el-icon>
              <span>添加其他</span>
            </div>

            <div class="item" @click="batchChangeData">
              <el-icon :style="{ fontSize: '16px', color: '#646a73' }"><Operation /></el-icon>
              <span>批量操作</span>
            </div>
          </div>
        </div>
        <span class="setting-item">
          <el-switch size="default" class="switch" v-model="localComponent.isRequired" @change="handleChangeRequired">
          </el-switch>
          <label for="">必填</label>
        </span>
      </div>
    </div>
    <div class="active-drag handle" v-if="compConfig.id === selectedComp?.id">
      <img src="/src/assets/images/form-editor/drag.svg" alt="" />
    </div>
    <div class="active-comp-setting-side-bar" v-if="compConfig.id === selectedComp?.id">
      <el-tooltip placement="right" content="复制">
        <el-icon :size="16" class="control" @click="compControl('copy')"><CopyDocument /></el-icon>
      </el-tooltip>
      <el-tooltip placement="right" content="逻辑">
        <el-icon :size="16" class="control" @click="compControl('logic')"><Magnet /></el-icon>
      </el-tooltip>
      <el-tooltip placement="right" content="删除" :color="'#f50'">
        <el-icon :size="16" class="control" @click="compControl('delete')"><Delete /></el-icon>
      </el-tooltip>
    </div>

    <BatchOperationData
      v-if="openBatchOperationDataBool"
      :open="openBatchOperationDataBool"
      :data-list="component.dataList"
      @handle-batch-operation="handleBatchOperation"
    >
    </BatchOperationData>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { JustShowCompType } from "../compData";
import { HasSettingTypeList } from "../compConfig";
// 显示组件
import FormTitleComponent from "./show/FormTitle.vue";
import ImageComponent from "./show/Image.vue";
// 基础组件
import InputComponent from "./base/Input.vue";
import TextareaComponent from "./base/Textarea.vue";
import RadioComponent from "./base/Radio.vue";
import CheckoutComponent from "./base/Checkout.vue";
import SelectComponent from "./base/Select.vue";
import NumberComponent from "./base/Number.vue";
// 评分组件
import RateComponent from "./base/Rate.vue";
import NPSComponent from "./base/NPS.vue";
// 日期组件
import DateComponent from "./base/Date.vue";
import DateRangeComponent from "./base/DateRange.vue";
import TimeComponent from "./base/Time.vue";
import TimeRangeComponent from "./base/TimeRange.vue";
// 布局组件
import DividerComponent from "./base/Divider.vue";
// 个人信息
import NameComponent from "./personal/Name.vue";
import WorkNumberComponent from "./personal/WorkNumber.vue";
import PhoneComponent from "./personal/Phone.vue";
import WxComponent from "./personal/WX.vue";
// 批量操作
import BatchOperationData from "./BatchOperationData.vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";

interface Props {
  component: any;
  type: string;
  lineNumber?: string;
  formConfig?: any;
  selectedComp?: any;
  isDev: boolean;
  renderType?: "preview";
  previewType?: "Phone" | "PC";
}
const props = defineProps<Props>();
const compStore = useSelectCompStore();
// 创建props的本地副本
const localComponent = ref({ ...props.component });

const displaySection = computed(() => !["Divider", "Paging", "FormTitle", "Img"].includes(props.type));
const compConfig = props.component; // 组件配置
const currentComp = getCompConfig(props.type); //组件
const emit = defineEmits(["compControl", "addItem"]);

// 修改标题和描述
const changeValue = (event: any, params: string) => {
  const value = event;
  const isChangeParams = ["description", "title"].includes(params);
  if (isChangeParams) {
    updateParams(params, value);
    compConfig[params] = value;
  } else {
    // const hasDataBool = innerText !== null && innerText !== "\n";
    // const value = hasDataBool ? innerText : "";
    // compConfig[params] = value;
  }
};

const updateParams = (params: string, value: any) => {
  compStore.updateCurrentComp({
    [params]: value
  });
  compStore.updateCurrentCompKey(uuidv4());
};

function getCompConfig(type: string) {
  const compType = { comp: getTypeToComponent(type) };
  const comp = { ...compConfig, ...compType };
  return comp;
}

function getTypeToComponent(type: string) {
  const compsObject: any = {
    FormTitle: FormTitleComponent,
    Input: InputComponent,
    Img: ImageComponent,
    Radio: RadioComponent,
    Checkout: CheckoutComponent,
    Rate: RateComponent,
    NPS: NPSComponent,
    Divider: DividerComponent,
    Date: DateComponent,
    DateRange: DateRangeComponent,
    Time: TimeComponent,
    TimeRange: TimeRangeComponent,
    Textarea: TextareaComponent,
    Name: NameComponent,
    WorkNumber: WorkNumberComponent,
    Phone: PhoneComponent,
    WX: WxComponent,
    Select: SelectComponent,
    Number: NumberComponent
  };
  const comp = compsObject[type];
  return comp;
}

// 展示的组件就不进行设置展示了
const isIgnoreEditor = () => {
  return JustShowCompType.includes(props.type);
};

const addItem = (type: string) => {
  emit("addItem", type);
};

const handleChangeRequired = (value: boolean) => {
  compStore.updateCurrentComp({
    isRequired: value
  });
  compStore.updateCurrentCompKey(uuidv4());
};

// 批量操作
const openBatchOperationDataBool = ref(false);
const batchChangeData = () => {
  openBatchOperationDataBool.value = true;
};

// 批量操作
const handleBatchOperation = (isOk: boolean, dataList: any[]) => {
  openBatchOperationDataBool.value = false;
  if (isOk) {
    updateParams("dataList", dataList);
  }
};

const checkAddOtherClass = () => {
  return _.filter(props.component.dataList, { subType: "other" }).length > 0;
};

// 操作
const compControl = (type: string) => {
  console.log(event, type, "compControl child");
  emit("compControl", type, props.component);
};

// 监听props变化并更新本地副本
watch(
  () => props.component,
  newVal => {
    localComponent.value = { ...newVal };
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
::v-deep {
  .el-textarea__inner {
    padding: 6px 12px !important;
    margin-left: -10px !important;
    font-size: 16px !important;
    color: rgb(73 96 141) !important;
    background: transparent;
    border: none !important;
    box-shadow: none !important;
    &:focus {
      outline: none;
      box-shadow: none;
    }
  }
  textarea.input-comp,
  span.input-comp {
    background: aliceblue;
  }
  .desc_input .el-textarea__inner {
    font-size: 14px !important;
    color: rgb(0 0 0 / 45%) !important;
  }
}
.description {
  /* 超出部分显示省略号 */
  width: 100%;
  padding: 6px 12px;
  margin-left: -10px;

  /* 不换行 */
  overflow: hidden;
  font-weight: 400;

  /* 隐藏超出部分 */
  text-overflow: ellipsis;
  overflow-wrap: break-word;
  white-space: normal;
  border-radius: 6px;
  outline: none;

  /* 设置宽度 */
}
.data-list-setting {
  left: 0;
  display: inline-block;
}
.add-item {
  position: relative;
  display: flex;
  flex-direction: row;
  cursor: pointer;
  .item {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 28px;
    font-size: 14px;
    font-weight: 400;
    color: rgb(0 0 0 / 75%);
    span {
      margin-left: 6px;
    }
  }
}
.disabled {
  color: #dddddd !important;
}
::v-deep(.ant-typography.ant-typography-warning) {
  padding: 2px 0;
  font-size: 14px;
  color: #646a73;
}
.line {
  height: 10px;
  margin: 0 12px;
  border-left: 1px solid #e0e0e0;
}
::v-deep(input[disabled]) {
  background: #ffffff !important;
}
::v-deep(textarea[disabled]) {
  background: #ffffff !important;
}
::v-deep(.ant-picker-disabled) {
  background: #ffffff !important;
}
::v-deep(.ant-time-disabled) {
  background: #ffffff !important;
}
::v-deep(.ant-input-affix-wrapper-disabled) {
  background: #ffffff !important;
}
::v-deep(
    .ant-select-disabled:where(.css-dev-only-do-not-override-17yhhjv).ant-select:not(.ant-select-customize-input)
      .ant-select-selector
  ) {
  background: #ffffff;
}
::v-deep(.ant-divider-horizontal.ant-divider-with-text::before) {
  transform: translateY(100%) !important;
}
::v-deep(.ant-divider-horizontal.ant-divider-with-text::after) {
  transform: translateY(100%) !important;
}
.control {
  &:active,
  &:hover {
    background: #ebebeb;
  }
}
.form-item {
  .comp-item {
    padding: 16px 60px 24px;
  }
}
.form-item-active {
  .comp-item {
    padding: 32px 60px 40px;
  }
}
.comp-item {
  position: relative;

  // padding: 20px 30px;
  .title-value {
    position: relative;
    font-weight: 400;
    color: rgb(73 96 141);
    .description {
      &:empty::before {
        font-weight: 200;
        color: #b3b3b3;
        content: "请输入标题";
      }
    }
  }
  .number {
    position: absolute;
    top: 6px;
    left: -40px;
  }
  .title-value-isRequired::before {
    position: absolute;
    top: 8px;
    left: -9px;
    display: inline-block;
    margin-inline-end: 4px;
    font-family: SimSun, sans-serif;
    font-size: 12px;
    line-height: 1;
    color: #ff4d4f;
    content: "*";
  }
  .comp-item-title {
    min-height: 36px;
    line-height: 36px;
  }
  .comp-item-description {
    padding-bottom: 10px;
    font-size: 14px;
    color: rgb(0 0 0 / 45%);
  }
}
.active-drag {
  position: absolute;
  top: 50%;
  left: 3px;
  width: 46px;
  height: 100%;
  padding: 10px 6px;
  font-size: 14px;
  cursor: move;
  border-radius: 6px;
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  transform: translateY(-50%);
  img {
    position: absolute;
    top: 50%;
    z-index: 1000000;
    width: 20px;
    transform: translateY(-50%);
  }
}
.active-comp-setting-side-bar {
  position: absolute;
  top: 50%;
  right: -34px;
  display: flex;
  flex-direction: column;
  width: 26px;
  padding: 5px 3px;
  font-size: 14px;
  background: #ffffff;
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  box-shadow: 1px 1px 3px silver;
  transform: translateY(-50%);
  .control {
    padding: 10px 5px;
  }
}
.active-comp-setting {
  position: relative;
  width: 100%;
  height: 44px;
  margin-top: 16px;
  line-height: 44px;
  .bottom-setting {
    display: grid;
    grid-template-columns: 1fr 100px;
    width: 100%;
  }
}
.item-comp {
  width: 100%;
}
.setting-item {
  position: absolute;
  top: 2px;
  right: 0;
  font-size: 14px;
  color: #646a73;
  .switch {
    position: relative;
    margin-top: -2px;
    margin-right: 5px;
  }
}
::v-deep(:where(.comp-item-description .css-dev-only-do-not-override-17yhhjv).ant-input-affix-wrapper-textarea-with-clear-btn) {
  left: -10px;
  background: transparent !important;
  .anticon-close-circle {
    display: none;
    &:hover,
    &:active,
    &:focus {
      display: block;
    }
  }
  :where(.comp-item-description .css-dev-only-do-not-override-17yhhjv).ant-input {
    color: rgb(0 0 0 / 45%);
    background: transparent !important;
    border-style: none;
    &:active,
    &:hover,
    &:focus {
      // border-style: solid;
      // border-color: #e0e0e0;
      outline: none;
      box-shadow: none;
    }
  }
}
</style>
