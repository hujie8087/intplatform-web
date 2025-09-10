<template>
  <div class="answer_view">
    <ProTable
      ref="proTable"
      highlight-current-row
      :columns="columns"
      :request-api="getTableList"
      :init-param="treeFilterValues"
      :data-callback="dataCallback"
      :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
    >
      <template #operation="scope">
        <el-button type="primary" @click="showDetail(scope.row)" :icon="View" circle />
        <!-- <el-button type="danger" :icon="Delete" circle /> -->
      </template>
    </ProTable>
  </div>
</template>

<script setup lang="tsx" name="listView">
import { reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { getAnswerList } from "@/api/modules/questionnaire/answer";
import { View } from "@element-plus/icons-vue";
// import { Delete } from "@element-plus/icons-vue";
const columns = reactive([
  { type: "selection", label: "", width: 80 },
  { prop: "serialNumber", label: "回答排序", align: "center", width: 120 },
  { prop: "submitRequestIp", label: "回答IP", align: "left" },
  {
    prop: "completeTime",
    label: "完成时间/毫秒",
    align: "left"
  },
  {
    prop: "submitOs",
    label: "来源",
    align: "left",
    render: scope => {
      let submitOs = scope.row.submitOs;
      let submitBrowser = scope.row.submitBrowser;
      return (
        <span>
          {submitOs}/{submitBrowser}
        </span>
      );
    }
  },
  {
    prop: "createTime",
    sortable: true,
    search: { el: "date-picker", span: 2, props: { type: "datetimerange", valueFormat: "YYYY-MM-DD HH:mm:ss" } },
    label: "提交时间",
    align: "left"
  },
  { prop: "operation", label: "操作", fixed: "right" }
]);
const treeFilterValues = reactive({ pageNum: 1, pageSize: 20 });
const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total
  };
};

const getTableList = (params: any) => {
  const newParams = JSON.parse(JSON.stringify(params)); // 深拷贝（可选）
  if (Array.isArray(newParams.createTime) && newParams.createTime.length === 2) {
    newParams.beginDateTime = newParams.createTime[0];
    newParams.endDateTime = newParams.createTime[1];
    delete newParams.createTime;
  }
  return getAnswerList(newParams);
};

const showDetail = (data: any) => {
  console.log(data, "data");
};
</script>

<style scoped lang="scss">
.answer_view {
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 20px;
  }
  ::v-deep .table-search {
    border: none;
  }
  ::v-deep .table-main {
    padding-top: 0;
    border: none;
    box-shadow: none;
  }
}
</style>
