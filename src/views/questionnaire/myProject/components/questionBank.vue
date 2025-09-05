<template>
  <div class="question-bank-page content">
    <!-- 左边设置栏 -->
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
    <!-- 中间 -->
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
  </div>
</template>

<script setup lang="ts" name="questionBank">
import { ref } from "vue";
import { CompListData, CompType, IgnoreLineNumberTypeList } from "./dynamicForm/compData";
import draggable from "vuedraggable";
import { getDefaultConfig } from "./dynamicForm/compConfig";
import Icon from "./dynamicForm/compIcon";
import { v4 as uuidv4 } from "uuid";
const compList = ref([...CompListData]); // 组件列表
const pageCompList = ref<any[]>([]); // 页面组件内容]
const openDraw = ref(false);
const onClone = (element: any) => createByClickOrClone(element);
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
const createCompByClick = (item: any) => {
  const createElement = createByClickOrClone(item);
  pageCompList.value.splice(pageCompList.value.length, 0, { ...createElement });
  updateCompLineNumber();
};
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
// 预览
const preview = () => {
  openDraw.value = true;
};
</script>

<style scoped lang="scss">
.question-bank-page {
  display: grid;
  grid-template-columns: 270px 1fr 260px;
  height: calc(100% - 86px);
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
  height: 100%;

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
    overflow: hidden auto;
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
        width: 20px;
        height: 20px;
        margin-top: -4px;
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
    background-image: url("./images/bg.png");
    background-repeat: round;
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
  ::v-deep(.form-footer) {
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
</style>
