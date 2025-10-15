<template>
  <div class="body">
    <el-drawer
      :title="formShowConfig.formTitle"
      class="drawer"
      :height="'calc(100% - 0px)'"
      direction="btt"
      size="100%"
      :style="{}"
      :body-style="{
        phone: previewType === 'Phone'
      }"
      :model-value="props.open"
      @close="onClose"
    >
      <template #header="{ titleId, titleClass }">
        <div class="drawer-header">
          <span :id="titleId" :class="titleClass">{{ $t("survey.form.previewComp.formPreview") }}</span>
          <div class="controls">
            <el-radio-group size="default" v-model="previewType">
              <el-radio-button label="Phone">{{ $t("survey.form.previewComp.Mobile") }}</el-radio-button>
              <el-radio-button label="PC">{{ $t("survey.form.previewComp.PC") }}</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <!-- <el-button size="default" type="primary" @click="onClose">取消</el-button> -->
        <!-- <el-button size="default" type="primary" style="margin-right: 8px" @click="onClose">保存</el-button> -->
      </template>

      <div
        ref="previewRef"
        class="body-content"
        :class="{
          phone: previewType === 'Phone'
        }"
      >
        <el-watermark :font="{ fontSize: 20 }" :content="selectForm?.displayWaterMark ? selectForm?.waterMarkText || '' : ''">
          <!-- <el-alert title="预览状态无法提交" type="warning" show-icon closable /> -->
          <div class="comps" v-if="pageCompList.length">
            <div
              v-for="item in pageCompList"
              :key="item?.name"
              :class="{
                'cursor-move': true,
                'form-item': true
              }"
            >
              <FormComponent
                v-if="!['paging'].includes(item.type) || (['paging'].includes(item.type) && formShowConfig.displayPaging)"
                :render-type="'preview'"
                :key="item.id + previewType"
                :component="item"
                :type="item.type"
                :is-dev="false"
                :form-config="selectForm"
                :preview-type="previewType"
                :is-preview-render="true"
                :editor-scroll-info="scrollInfo"
                @comp-focus="selectComp"
                @click="selectComp(item)"
              >
              </FormComponent>
            </div>
            <div
              class="form-footer"
              :class="{
                'form-item': true
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
                style="width: 76%"
                :style="{ padding: getSize(), lineHeight: getLineheight() }"
              >
                {{ pageFooter.buttonText || "提交" }}
              </el-button>
            </div>
          </div>
          <div v-else class="no-data">
            <img src="@/assets/images/form-editor/no_data.svg" alt="" />
            <div class="description">{{ $t("survey.form.previewComp.nullDataTip") }}</div>
          </div>
          <SupportComp />
        </el-watermark>
      </div>
    </el-drawer>
  </div>
</template>
<script setup lang="ts">
type PreviewType = "Phone" | "PC";
import { ref, watch, reactive, nextTick } from "vue";
import { Check } from "@element-plus/icons-vue";
import FormComponent from "../components/componentsForm/index.vue";
import SupportComp from "./component/SupportComp.vue";
// import { useSelectCompStore } from "@/stores/modules/selectCompStore";
// const useCompStore = useSelectCompStore();

const formShowConfig = ref({
  formTitle: "表单预览",
  waterMarkBool: true,
  displayPaging: true
});

const previewType = ref<PreviewType>("Phone");
const emit = defineEmits(["onClose"]);

interface Props {
  open: any;
  selectForm: any;
  pageFooter: any;
  pageCompList: any[];
}

const props = defineProps<Props>();
// 滚动
// 1. 定义滚动信息的 TypeScript 接口（类型安全）
interface ScrollInfo {
  scrollHeight: number; // 内容总高度
  clientHeight: number; // 可视区域高度
  scrollTop: number; // 已滚动距离
  isAtBottom: boolean; // 额外判断：是否滚动到底部（可选）
}
// 2. 获取 .body 元素的 DOM 引用（初始为 null）
const previewRef = ref<HTMLDivElement | null>(null);
// 3. 响应式变量存储滚动信息（初始值为 0）
const scrollInfo = reactive<ScrollInfo>({
  scrollHeight: 0,
  clientHeight: 0,
  scrollTop: 0,
  isAtBottom: false // 可选：用于快速判断是否到底部
});

const updateBodyScrollInfo = () => {
  const scrollContainer = previewRef.value;
  if (!scrollContainer) return;
  const { scrollHeight, clientHeight, scrollTop } = scrollContainer;
  scrollInfo.scrollHeight = scrollHeight;
  scrollInfo.clientHeight = clientHeight;
  scrollInfo.scrollTop = scrollTop;
  // 4. 可选：判断是否滚动到底部（留 1px 误差，避免精度问题）
  scrollInfo.isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
};

watch(
  () => props.open,
  async newValue => {
    if (newValue) {
      await nextTick();
      const scrollContainer = previewRef.value;
      if (!scrollContainer) return;
      // 2. 初始时主动更新一次滚动信息（获取初始状态）
      updateBodyScrollInfo();
      // 3. 绑定 scroll 事件：滚动时实时更新
      scrollContainer.addEventListener("scroll", updateBodyScrollInfo);
    }
  },
  {
    immediate: true
  }
);

const onClose = () => {
  emit("onClose");
};

const getSize = () => {
  const data = props.pageFooter?.value;
  return data?.size == "large" ? "0 26px" : data?.size == "small" ? "0 10px" : "0 16px";
};

const getLineheight = () => {
  const data = props?.pageFooter?.value;
  return data?.size == "large" ? "40px" : data?.size == "small" ? "24px" : "32px";
};

// 组件选中
const selectComp = (item: any) => {
  console.log(item, "item");
  // useCompStore.initCurrentComp(item);
};
</script>

<style scoped lang="scss">
.alert {
  margin: 0 10px;
}
:deep(.el-drawer__body) {
  background-image: url("../../dynamicForm/bg.jpg");
}
:deep(.el-radio-button.is-active .el-radio-button__original-radio:not(:disabled) + .el-radio-button__inner) {
  color: #ffffff !important;
}
.body-content {
  position: relative;
  left: 50%;
  width: 686px;
  height: calc(100% - 20px);
  padding: 20px 0 30px;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 6px;
  transform: translateX(-50%);
  &.phone {
    width: 392px;
    overflow-x: hidden !important;
    .form-item .comp-item {
      padding: 18px 20px;
    }
    .form-footer {
      width: 390px;
      margin-top: 15px;
    }
    :deep(.comp-item .number) {
      left: 5px;
    }
  }
}
.comps {
  width: 100%;
  height: 100%;
}
.form-footer {
  width: 100%;
  height: 90px;
  margin-top: 30px;
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
.no-data {
  margin: 20px;
  font-size: 16px;
  color: #666666;
  text-align: center;
  img {
    width: 300px;
    margin: 20px;
  }
}
.controls {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  .cont-item {
    padding: 2px 5px;
  }
}
</style>
