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
          <span :id="titleId" :class="titleClass">表单预览</span>
          <div class="controls">
            <el-radio-group size="default" v-model="previewType">
              <el-radio-button label="Phone">移动端</el-radio-button>
              <el-radio-button label="PC">桌面端</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <!-- <el-button size="default" type="primary" @click="onClose">取消</el-button> -->
        <!-- <el-button size="default" type="primary" style="margin-right: 8px" @click="onClose">保存</el-button> -->
      </template>

      <div
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
                :editor-scroll-info="editorScrollInfo"
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
                style="width: 120px"
                :style="{ padding: getSize(), lineHeight: getLineheight() }"
              >
                {{ pageFooter.buttonText || "提交" }}
              </el-button>
            </div>
          </div>
          <div v-else class="no-data">
            <img src="@/assets/images/form-editor/no_data.svg" alt="" />
            <div class="description">表单为空，请返回编辑器配置内容</div>
          </div>
          <SupportComp />
        </el-watermark>
      </div>
    </el-drawer>
  </div>
</template>
<script setup lang="ts">
type PreviewType = "Phone" | "PC";
import { ref } from "vue";
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
  editorScrollInfo: any;
}

const props = defineProps<Props>();

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
  console.log(item, "item-->");
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
  position: absolute;
  left: 50%;
  width: 686px;
  height: calc(100% - 110px);
  padding: 20px 0 30px;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 6px;
  transform: translateX(-50%);
  &.phone {
    width: 392px;
    overflow-x: hidden !important;
    .form-item .comp-item {
      padding: 10px 20px 30px;
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
