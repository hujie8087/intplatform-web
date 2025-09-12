<template>
  <div class="form-editor">
    <div class="content editor-content">
      <div class="comps">
        <div class="comp-category-item" v-for="(compCategory, index) in compList" :key="index">
          <div class="category-title">
            <el-text size="default" class="title">{{ compCategory.name }}</el-text>
          </div>
          <draggable
            :group="{ name: 'componentsGroup', pull: 'clone', put: false }"
            class="flex flex-col gap-2 p-4 w-300px bg-gray-500/5 rounded compList"
            :list="compCategory.children"
            :sort="false"
            :clone="onClone"
            item-key="index"
          >
            <!-- 使用item插槽来定义可拖拽项 -->
            <template #item="{ element, indexs }">
              <div
                :key="indexs"
                class="cursor-move h-50px bg-gray-500/5 item"
                :class="{
                  person: element.type === 'Personal Component',
                  advanced: element.type === 'Advanced Component',
                  layout: element.type === 'Layout Component'
                }"
                @click="createCompByClick(element)"
              >
                <div class="components-body">
                  <img class="icon" :src="element.icon" alt="" v-if="element.icon" />
                  {{ element.label }}
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>
      <div class="editor">
        <div class="preview-control" title="预览" @click="preview">
          <img :src="Icon.preview" alt="" />
          <div class="label">预览</div>
        </div>
        <div
          class="form"
          :class="{
            'no-data': !pageCompList?.length
          }"
        >
          <div class="body">
            <el-watermark :font="{ fontSize: 14 }" :content="selectForm?.displayWaterMark ? selectForm?.waterMarkText : ''">
              <div class="form-body form-body-content">
                <div class="comp-list-content">
                  <draggable
                    group="componentsGroup"
                    :animation="150"
                    ghost-class="ghost"
                    handle=".handle"
                    :list="pageCompList"
                    class="flex flex-col gap-2 p-4 w-300px max-h-350px m-auto bg-gray-500/5 rounded overflow-auto form-body"
                    item-key="id"
                  >
                    <!-- 空状态显示 - 使用footer插槽放置非拖拽内容 -->
                    <template #footer>
                      <div
                        v-if="!pageCompList?.length"
                        @dragenter="handleDragHandle"
                        @mouseleave="handleDragHandle"
                        @dragleave="handleDragHandle"
                      >
                        <div
                          class="no-data-content"
                          :class="{
                            dragenter: noDataContentRef === 'dragenter'
                          }"
                        >
                          <span
                            class="text"
                            :class="{
                              'has-data': pageCompList.length
                            }"
                          >
                            点击左侧题目 / 拖拽题目到此区域
                          </span>
                        </div>
                      </div>
                    </template>
                    <!-- 可拖拽项 - 使用item插槽 -->
                    <template #item="{ element, index }">
                      <div
                        :class="{
                          'cursor-move': true,
                          'form-item': true,
                          'active-comp': activeComp.id == element?.id
                        }"
                        @click="selectComp(element)"
                      >
                        <ComponentsForm
                          :key="element?.id"
                          @comp-control="compControl"
                          @add-item="addItem($event, element, index)"
                          :component="element"
                          :form-config="selectForm"
                          :type="element?.type"
                          :is-dev="isFormEditorDevBool"
                          :selected-comp="getActiveComp()"
                        >
                        </ComponentsForm>
                      </div>
                    </template>
                  </draggable>
                </div>
              </div>

              <div
                class="form-footer"
                @click="selectComp(pageFooter)"
                v-if="globalData && globalData.displayBtn"
                :class="{
                  'form-item': true,
                  'active-comp': activeComp.id === pageFooter.id
                }"
                :style="{
                  'text-align': pageFooter.position || 'left'
                }"
              >
                <el-button
                  class="submit"
                  type="primary"
                  color="#1677FF"
                  :icon="pageFooter.buttonIconShowBool ? Check : null"
                  :size="pageFooter.size"
                  style="width: 120px"
                  :style="{ padding: getSize(), lineHeight: getLineHeight() }"
                >
                  {{ pageFooter.buttonText || "提交" }}
                </el-button>
              </div>
            </el-watermark>
          </div>
        </div>
      </div>
      <FormSetting
        v-if="selectForm"
        :key="activeComp.id + updateCompKey"
        :current-comp-id="activeComp.id"
        :select-form="selectForm"
        :select-comp="getActiveComp()"
      ></FormSetting>
      <PreviewPage
        v-if="openDraw"
        :select-form="selectForm"
        :open="openDraw"
        :page-comp-list="pageCompList"
        :page-footer="pageFooter"
        @on-close="onClose"
      >
      </PreviewPage>
      <!-- 逻辑弹窗 -->
      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="550" @close="logicDialogCancel">
        <div class="dialog-form">
          <div v-for="(item, index) in logicArr" :key="index" class="logic-row">
            <span class="label">如果本题回答</span>
            <el-select v-model="item.optionValue" placeholder="请选择选项">
              <el-option :label="elItem?.label" :value="elItem?.value" v-for="elItem in logicTopicSelect" :key="elItem?.value" />
            </el-select>
            <span class="label">则</span>
            <el-select v-model="item.expression">
              <el-option label="显示" value="eq" />
            </el-select>
            <el-select v-model="item.formItemId">
              <el-option :label="elItem.label" :value="elItem.value" v-for="elItem in topicArr" :key="elItem.value" />
            </el-select>
            <el-button
              link
              class="is-link"
              type="danger"
              :icon="Delete"
              :disabled="index == 0"
              @click="removeLogicItem(index)"
            ></el-button>
            <el-button
              link
              class="is-link"
              type="success"
              :icon="CirclePlus"
              @click="addLogicItem"
              style="margin-left: -8px"
            ></el-button>
          </div>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="logicDialogCancel">取消</el-button>
            <el-button type="primary" @click="logicDialogSure"> 保存</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, inject } from "vue";
import { CompListData, CompType, IgnoreLineNumberTypeList } from "./components/compData";
import { getDefaultConfig, optionalType, cleanData } from "./components/compConfig";
import Icon from "./components/compIcon";
import { Check, Delete, CirclePlus } from "@element-plus/icons-vue";
import FormSetting from "./components/FormSetting.vue";
import ComponentsForm from "./components/componentsForm/index.vue";
import PreviewPage from "./preview/previewPage.vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
import draggable from "vuedraggable";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";
import { topicSaves, editSurverTopic, getSurverDetail } from "@/api/modules/questionnaire/surveySetting";

const openDraw = ref(false);
const compList = ref([...CompListData]); // 组件列表

const pageCompList = ref<any[]>([]); // 页面组件内容]
const dialogVisible = ref(false); // 逻辑弹窗
const dialogTitle = ref("");
const logicArr = ref([{ optionValue: "", expression: "eq", formItemId: "" }]);
const logicTopicSelect = ref([]);
const topicArr = ref([]);
const currentSettingLogicTopic = ref({});
const setTopicIndex = ref(0);
const projectKey = inject("projectKey");
watch(
  pageCompList,
  newValue => {
    pageCompList.value = newValue;
    updateCompLineNumber();
  },
  { deep: true }
);

const onClone = (element: any) => {
  return createByClickOrClone(element);
};

const createCompByClick = (item: any) => {
  const createElement = createByClickOrClone(item);
  pageCompList.value.splice(pageCompList.value.length, 0, { ...createElement });
  updateCompLineNumber();
};

const createByClickOrClone = (element: any) => {
  const defaultComp: any = getDefaultConfig(element.type);
  const item = {
    ...defaultComp,
    ...element.value,
    id: element.id || uuidv4(),
    title: element.name,
    type: element.type,
    name: element.name
  };
  return { ...item };
};

/**
 * 编辑器编辑内容
 * 1. pageHeader // 底部配置
 * 2. pageCompList // 页面组件
 * 3. pageFooter // 底部提交按钮配置
 */
const noDataContentRef = ref(); // 无数据内容
const activeComp = ref<ActiveCompType>({
  type: "component",
  id: ""
}); // 当前选中组件
const selectForm = ref();
const updateCompKey = ref();
const globalData = ref();
// 选中组件
const currentComp = ref();

// 拖拽触发动作
const handleDragHandle = (e: any) => {
  e.preventDefault();
  const { type } = e;
  noDataContentRef.value = type;
};

// 组件选中
const selectComp = (item: any) => {
  useCompStore.initCurrentComp({
    ...item
  });
  activeComp.value.id = item.id;
};

const getActiveComp = () => {
  //组件列表
  const item = _.filter(pageCompList.value, (item: any) => item.id === activeComp.value.id)?.[0];
  if (item) {
    return item;
  }
  if (activeComp.value.id === pageFooter.value.id) {
    return pageFooter.value;
  }
};

// 添加选项
const addItem = (type: "new" | "other", item: any, index: number) => {
  const isNewBool = type === "new";
  const newDataItem = isNewBool
    ? {
        label: "选项",
        value: "选项"
      }
    : {
        subType: "other",
        label: "其他",
        value: ""
      };
  if (["new", "other"].includes(type)) {
    pageCompList.value[index].dataList.push(newDataItem);
  }
  updateDataListIndex(index);
  initDataState();
};

const updateDataListIndex = (index: number) => {
  if (index > -1 && Array.isArray(pageCompList.value[index]?.dataList)) {
    _.map(pageCompList.value[index].dataList, (item: any, index: number) => {
      item._index = index;
    });
  }
};
// 这个地方有复制/逻辑/删除的处理方法
const compControl = (controlType: string, value: any) => {
  const index = _.findIndex(pageCompList.value, (item: any) => item.id === value.id);
  if (index === -1) {
    return false;
  }
  setTopicIndex.value = index;
  if (controlType === "copy") {
    // 复制逻辑
    const newComp: any = {
      ...value,
      id: uuidv4()
    };
    pageCompList.value.splice(index + 1, 0, { ...newComp });
  } else if (controlType === "delete") {
    // 删除逻辑
    const deleteComp = pageCompList.value.splice(index, 1);
    if (pageCompList.value.length > 1) {
      activeComp.value.id = pageCompList.value[index - 1]?.id;
    } else {
      activeComp.value.id = "";
    }
    // 如果删除当前的题目，需要检查历史跟他的关联的逻辑规则需要删掉
    if (deleteComp.length) {
      let nowId = deleteComp?.[0]?.id;
      pageCompList.value.forEach(item => {
        let i = null;
        if (item.expresson) {
          item.expresson.forEach((el, cIndex) => {
            if (el.formItemId == nowId) {
              i = cIndex;
            }
          });
          if (i != null) {
            item.expresson.splice(i, 1);
          }
        }
      });
    }
    deleteSuccess(deleteComp?.[0]?.name);
  } else {
    // 逻辑处理
    // logic
    const nowItem = pageCompList.value[index];
    currentSettingLogicTopic.value = nowItem;
    dialogTitle.value = nowItem.title + "逻辑设置";
    logicTopicSelect.value = nowItem.dataList;
    let otherArr = pageCompList.value.filter(item => item.id !== nowItem.id);
    if (otherArr.length) {
      topicArr.value = otherArr.map(item => ({
        label: item.title,
        value: item.id
      }));
    }
    // 如果有配置项需要反显，那个时候是编辑
    if (nowItem?.expresson) {
      logicArr.value = nowItem?.expresson;
    }
    dialogVisible.value = true;
  }
  initDataState();
  updateCompLineNumber();
};
// 删除逻辑规则
const removeLogicItem = index => {
  logicArr.value.splice(index, 1);
};
// 增加逻辑规则
const addLogicItem = () => {
  logicArr.value.push({ optionValue: "", expression: "eq", formItemId: "" });
};
// 弹窗逻辑取消
const logicDialogCancel = () => {
  dialogVisible.value = false;
  logicArr.value = [{ optionValue: "", expression: "eq", formItemId: "" }];
  logicTopicSelect.value = [];
  topicArr.value = [];
};
// 弹窗逻辑提交
const logicDialogSure = () => {
  const invalid = logicArr.value.some(item => !item.optionValue || !item.expression || !item.formItemId);
  if (invalid) {
    ElMessage.warning("请填写所有逻辑规则后再保存!");
    return false;
  }
  dialogVisible.value = false;
  currentSettingLogicTopic.value = {
    ...currentSettingLogicTopic.value,
    expresson: logicArr.value
  };
  pageCompList.value[setTopicIndex.value] = currentSettingLogicTopic.value;
  logicDialogCancel();
};

const initDataState = () => {
  noDataContentRef.value = "";
};

const deleteSuccess = (compName = "") => {
  ElMessage({
    message: `【${compName}】删除成功！`,
    type: "success"
  });
};

// 预览
const preview = () => {
  openDraw.value = true;
};

const onClose = () => {
  openDraw.value = false;
};

const isFormEditorDevBool = computed(() => {
  const bool = useRoute().path.includes("form-editor") || useRoute().path.includes("AddSurvery");
  return bool;
});

// 更新选中组件数据
const updateCompByChange = (compConfig: any) => {
  currentComp.value = compConfig;
  const index = getActiveCompIndex();
  if (index > -1 && pageCompList.value.length) {
    pageCompList.value[index] = { ...pageCompList.value[index], ...compConfig };
  }
};

const getActiveCompIndex = () => {
  return _.findIndex(pageCompList.value, (item: any) => item.id === activeComp.value.id);
};

const useCompStore = useSelectCompStore();
const defaultFormConfig = {
  displayNumberSort: true,
  displayDescription: true,
  displayTitle: true,
  displayBtn: true,
  displayWaterMark: false,
  waterMarkText: "IWIP"
};

interface FooterType {
  id: string;
  size: string;
  buttonText: string;
  position: "left" | "right" | "center";
  buttonIconShowBool: boolean;
}

const pageFooter = ref<FooterType>({
  id: "",
  size: "large",
  position: "center",
  buttonText: "提交",
  buttonIconShowBool: true
}); // 底部

const getSize = () => {
  const data = pageFooter?.value;
  return data?.size == "large" ? "0 26px" : data?.size == "small" ? "0 10px" : "0 16px";
};

const getLineHeight = () => {
  const data = pageFooter.value;
  return data.size == "large" ? "40px" : data.size == "small" ? "24px" : "32px";
};

onMounted(async () => {
  const data = useCompStore.initGlobalFormConfig({ ...defaultFormConfig });
  globalData.value = useCompStore.currentGlobalFormConfig;
  console.log(data, "初始化全局数据");
  // 组件初始化
  // pageHeader.value = getDefaultConfig(CompType.formTitle, true)
  // pageHeader.value.id = uuidv4()
  pageFooter.value = getDefaultConfig(CompType.button);
  pageFooter.value.id = uuidv4();
  let topicList: any = await editSurverTopic(projectKey);
  topicList.data.forEach(el => {
    pageCompList.value.push(el.expand);
  });
  let sureryDeatil: any = await getSurverDetail(projectKey);
  if (sureryDeatil.code == 200) {
    let pageFooter = sureryDeatil?.data?.pageFooter ?? {};
    let selectForm = sureryDeatil?.data?.selectForm ?? {};
    if (Object.keys(pageFooter).length > 0) {
      pageFooter.value = pageFooter;
    }
    if (Object.keys(selectForm).length > 0) {
      useCompStore.updateGlobalFormConfig(selectForm);
    }
  }
});

const currentCompKeyData = computed(() => useCompStore.currentCompKey);

watch(currentCompKeyData, newValue => {
  updateCompKey.value = newValue;
});

// 更新组件编号
const updateCompLineNumber = () => {
  if (Array.isArray(pageCompList.value)) {
    let lineNumber = 0;
    let pageCount = _.filter(pageCompList.value, {
      type: CompType.paging
    })?.length;
    let pageNumber = 0;
    _.map(pageCompList.value, (item: any) => {
      const isIgnoreTypeBool = IgnoreLineNumberTypeList.includes(item.type);
      const isPageTypeBool = CompType.paging === item.type;
      if (!isIgnoreTypeBool) {
        lineNumber++;
        item.lineNumber = lineNumber && lineNumber.toString()?.length === 1 ? "0" + lineNumber : lineNumber;
      }
      if (isPageTypeBool) {
        pageNumber++;
        item.pagingValue = `第 ${pageNumber} 页 / 共 ${pageCount} 页`;
      }
    });
  }
};

watch([() => useCompStore.compConfig, () => useCompStore.currentGlobalFormConfig], ([compConfig, currentGlobalFormConfig]) => {
  updateCompByChange({
    ...compConfig
  });
  selectForm.value = currentGlobalFormConfig;
  console.log(selectForm.value, "selectForm.value");
});
// 保存问卷答题
const saveSurveryFun = async projectKey => {
  const listTopic = pageCompList.value;
  console.log(listTopic);
  let setRequestParams = {
    project: {
      projectKey,
      selectForm: cleanData(selectForm.value),
      pageFooter: cleanData(pageFooter.value)
    },
    projectItemSaveVo: []
  };
  let projectItemSaveVo = [];
  listTopic.forEach(item => {
    item.dataValue = "";
    let obj = {
      projectKey,
      formItemId: item.id,
      type: item.type,
      title: item.title,
      // 是否显示类型，不需要用户操作的组件，单纯为了展示的组件
      isDisplayType: optionalType.includes(item.type),
      required: item?.isRequired ?? false,
      expand: cleanData(item)
    };
    projectItemSaveVo.push(obj);
  });
  setRequestParams["projectItemSaveVo"] = projectItemSaveVo;
  const res = await topicSaves(setRequestParams, projectKey);
  if (res.code == 200) {
    ElMessage({
      message: `答卷保存成功！`,
      type: "success"
    });
  } else {
    console.error("保存文件失败");
  }
};
defineExpose({
  saveSurveryFun
});
</script>

<style scoped lang="scss">
.icon {
  width: 20px;
  height: 20px;
  margin-top: -4px;
}
.form-editor {
  width: 100%;
  min-width: 1260px;
  height: 100%;
  overflow: hidden;

  /* 主色调 - 蓝色系 */
  --el-color-primary: #1677ff;
}
.nav-data {
  height: 56px;
  padding: 0 50px;
  line-height: 1;
  box-shadow: inset 0 -1px 0 #e7e7e7;
  .title-data {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 56px;
    font-size: 16px;
    .time {
      align-self: auto;
      margin-top: 6px;
    }
  }
}
.editor-content {
  display: grid;
  grid-template-columns: 270px 1fr 260px;
  height: 100%;
  padding: 0;

  @media (width <= 1400px) {
    grid-template-columns: 220px 1fr 220px;
    overflow-x: auto;
    .form {
      width: auto;
    }
  }

  @media (width <= 1400px) {
    grid-template-columns: 260px 1fr 250px;
    overflow-x: auto;
    .form {
      width: auto;
    }
  }
  :deep(.content .compList .item) {
    font-size: 14px;
  }
}
.content {
  /* background-image: url(/src/assets/form-editor/bg-body.png); */
  .category-title {
    display: flex;
    align-items: center;
    padding: 15px 0;
    font-size: 14px;
    font-weight: 400;
    color: rgb(0 0 0 / 65%);
    user-select: none;
    .title {
      margin-right: 4px;
    }
  }
  .comps {
    max-height: 100%;
    padding: 0 20px;
    overflow-y: auto;
    background: #fafafa;
  }
  .compList {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 10px;
    margin-bottom: 15px;
    user-select: none;
    .item {
      height: 38px;
      padding: 0 2px 0 10px;
      font-size: 15px;
      font-weight: 400;
      line-height: 38px;

      /* color: #141E31; */
      color: rgb(0 0 0 / 45%);
      text-align: left;

      /* border: 1px solid #D7D9DC; */

      /* background: rgba(0, 102, 255, .08); */
      cursor: pointer;

      // border: 1px solid #ebebeb;
      background: #ffffff;
      border-radius: 5px;
      &:hover {
        border-color: royalblue;
      }

      @media (width <= 1400px) {
        font-size: 14px;
      }
    }
    &.hover {
      .item {
        color: #151b26 !important;
      }
    }
    .components-body {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      .icon {
        margin-right: 5px;
      }
    }
  }
  .editor {
    position: relative;

    /* background: lavender; */
    height: 100%;
    padding: 0;
    margin: 0;
    overflow-y: auto;
    background-image: url("./bg.png");
    background-repeat: round;
  }
  .body {
    /* background-size: 20px 20px, 20px 20px, 100px 100px, 100px 100px;
    background-image: linear-gradient(rgba(200,205,208,.2) 1px,transparent 0),linear-gradient(90deg,rgba(200,205,208,.1),1px,transparent 0),linear-gradient(rgba(200,205,208,.1) 1px,transparent 0),linear-gradient(90deg,rgba(200,205,208,.1) 1px,transparent 0); */
    height: 100%;
    padding: 20px;
    background: #ffffff;
    border-radius: 6px;
    .form-header {
      padding: 0;
      margin-bottom: 10px;
      img {
        width: 100%;
        height: 220px;
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
      }
      .title {
        margin-bottom: 10px;
        font-size: 18px;
        font-weight: 600;
        color: rgb(0 0 0 / 80%);
        text-align: center;
      }
      .description {
        margin: 10px;
        font-size: 14px;
        color: rgb(0 0 0 / 80%);
        text-align: center;
      }
    }
  }
  .form {
    position: absolute;
    display: grid;
    width: 686px;

    /* background: #fff; */
    min-height: calc(100% - 70px);
    padding-bottom: 10px;
    margin: 10px 30px;
    margin-left: 50%;
    border-radius: 0;
    transform: translateX(-50%);
    .sortable-chosen:not(.active-comp) {
      z-index: 0;
      width: calc(100% - 0px);
      padding: 48px 0;
      margin: 2px 0;
      text-align: center;
      background: aliceblue;
      border: 1px dashed #94b4ff;
      border-radius: 4px;
    }
    &.no-data {
      .sortable-chosen {
        width: calc(100% - 4px);
        margin: 2px;
      }
    }
  }
  .form-item {
    position: relative;
    background: #ffffff;
  }
  .active-comp {
    position: relative;
    background: aliceblue;
    border: 1px dashed #94b4ff;
    border-radius: 5px;
    box-shadow:
      0 4px 16px 4px rgb(31 35 41 / 3%),
      0 4px 8px 0 rgb(31 35 41 / 2%),
      0 2px 4px -4px rgb(31 35 41 / 2%);
    &::before {
      position: absolute;
      display: block;
      width: 4px;
      height: 100%;
      content: "";
    }
  }
  .no-data-content {
    position: absolute;
    top: -2px;
    width: calc(100% - 0px);
    padding: 50px 0;
    color: #666666;
    text-align: center;
    border: 1px dashed #cdcdcd;
    border-radius: 4px;
    &:hover,
    &.dragenter {
      z-index: 1000;
      color: #1677ff;
      border-color: #1677ff;
    }
  }
  .form-body-content {
    min-height: 120px;
  }
  .form-footer {
    width: 100%;
    height: 90px;
    margin-top: 20px;
    line-height: 90px;
  }
  :deep(.form-footer) {
    .submit {
      max-width: 100%;

      /* 不换行 */
      overflow: hidden;

      /* 隐藏超出部分 */
      text-overflow: ellipsis;
      white-space: nowrap;

      /* 显示省略号 */
    }
  }
}
.preview-control {
  position: fixed;
  top: 0;
  top: 66px;
  left: 50%;
  z-index: 99;
  width: 50px;
  height: 55px;
  padding: 5px 4px;
  font-size: 14px;
  color: #666666;
  text-align: center;
  cursor: pointer;
  background: #ffffff;
  border: 1px solid #ffffff;
  border-radius: 5px;
  box-shadow: 0 0 6px rgb(0 0 0 / 8%);
  transform: translateX(388px);
  img {
    width: 24px;
    height: 24px;
  }
  .label {
    padding-top: 5px;
    font-size: 12px;
  }
  &:hover {
    color: #1677ff;
    background: #fafafa;
  }
}
:deep(.ant-drawer-bottom > .ant-drawer-content-wrapper) {
  height: calc(100% - 50px) !important;
}
.callback {
  position: absolute;
  left: 12px;
  padding-top: 16px;
  cursor: pointer !important;
  img {
    width: 24px;
    height: 24px;
    cursor: pointer;
  }
}
.control {
  position: absolute;
  top: 12px;
  right: 6px;
  display: flex;
  flex-grow: 2;
  .cont-item {
    margin-right: 10px;
    cursor: pointer;
  }
  .btn-icon {
    width: 18px;
    padding: 0;
    margin-top: -2px;
    filter: grayscale(1);
  }
  &:hover {
    .btn-icon {
      filter: grayscale(0);
    }
  }
  .name {
    padding: 0 4px;
  }
}
.form-header {
  margin: 0;
  .title {
    height: 42px;
    line-height: 42px;
    .title-val {
      font-size: 20px;
    }
  }
  .description-value {
    margin: 8px 0 30px;
    color: rgb(0 0 0 / 45%);
  }
}
.comp-list-content {
  position: relative;
  min-height: 130px;
}

/* 关键：强制容器内的Element组件使用容器内的CSS变量 */
.form-editor .el-button--primary {
  background-color: var(--el-color-primary) !important;
  border-color: var(--el-color-primary) !important;
}
.form-editor .el-button--primary:hover {
  background-color: var(--el-color-primary-light-3) !important;
  border-color: var(--el-color-primary-light-3) !important;
}
.form-editor .el-input__inner:focus {
  border-color: var(--el-color-primary) !important;
  box-shadow: 0 0 0 2px rgb(114 46 209 / 20%) !important;
}
.form-editor .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: var(--el-color-primary) !important;
  border-color: var(--el-color-primary) !important;
}
.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 8px; /* 每行的间距 */
}
.logic-row {
  display: flex;
  gap: 8px; /* 控制每个元素之间的间隔 */
  align-items: center;
}
.logic-row .label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap; /* 避免换行 */
}
.logic-row .el-button.is-link {
  padding: 6px; /* 增加点击区域 */
  font-size: 15px; /* 调整图标大小 */
}
</style>
