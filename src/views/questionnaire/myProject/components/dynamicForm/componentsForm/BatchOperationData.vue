<template>
  <el-dialog v-model="open" title="批次操作数据">
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
        <el-button @click="handleSubmit('cancel')">取消</el-button>
        <el-button type="primary" @click="handleSubmit('ok')"> 确定 </el-button>
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

<style lang="scss" scoped></style>
