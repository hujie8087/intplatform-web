<template>
  <el-dialog
    v-model="open"
    :top="editorScrollInfo.scrollTop + 120 + 'px'"
    :show-close="false"
    :close-on-click-modal="false"
    class="dialog-wrapper-center"
    :title="$t('survey.form.batchOper')"
  >
    <template #footer>
      <div class="content">
        <el-input
          size="default"
          type="textarea"
          placeholder="请输入批次操作数据（每行一条数据）"
          allow-clear
          v-model="batchDataValue"
          :autosize="{ minRows: 3, maxRows: 30 }"
        ></el-input>
      </div>
      <div class="dialog-footer">
        <el-button @click="handleSubmit('cancel')">{{ $t("main.cancel") }}</el-button>
        <el-button type="primary" @click="handleSubmit('ok')"> {{ $t("main.confirm") }} </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
const emit = defineEmits(["handleBatchOperation"]);
interface Props {
  open: boolean;
  dataList: any[];
  editorScrollInfo: any;
}
const props = defineProps<Props>();
const open = ref(props.open || null);

const batchDataValue = ref("");
const dataList: any = ref(props.dataList);

const handleSubmit = (state: string) => {
  const isOk = state === "ok";
  if (isOk) {
    const val = batchDataValue.value;
    const nextData: any[] = [];
    if (val) {
      const _list = val.split("\n").filter(item => item?.length > 0 && item);
      if (Array.isArray(_list)) {
        _list.forEach((element, index) => {
          nextData.push({
            label: element,
            value: element,
            _index: index
          });
        });
      }
    }
    dataList.value = nextData;
  }
  emit("handleBatchOperation", isOk, dataList.value);
};

onMounted(() => {
  let val = "";
  props.dataList.map(item => (val += item.value + "\n"));
  batchDataValue.value = val;
});
</script>

<style lang="scss" scoped>
// 保持对话框居中的基础样式
:deep(.dialog-wrapper) {
  left: 50% !important;
  margin: 0 !important;
  transform: translateX(-50%) !important;
}
</style>
