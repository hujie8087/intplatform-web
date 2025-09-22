<template>
  <div class="answer_view main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getTableList"
        :init-param="treeFilterValues"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
      >
        <template #tableHeader>
          <el-button type="warning" :icon="Download" @click="exportFile">批量导出</el-button>
        </template>
        <template #operation="scope">
          <el-tooltip placement="top" effect="dark" content="查看问卷">
            <el-button link type="success" :icon="View" @click="showDetail(scope.row)" />
          </el-tooltip>
          <!-- <el-tooltip placement="top" effect="dark" content="导出结果">
            <el-button link type="primary" :icon="Document" @click="showDetail(scope.row)" />
          </el-tooltip> -->
        </template>
      </ProTable>
    </div>
  </div>
</template>

<script setup lang="tsx" name="listView">
import { reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { getAnswerList, exportAnswerResult } from "@/api/modules/questionnaire/answer";
// Document
import { View, Download } from "@element-plus/icons-vue";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const key = route.query.key as string | undefined;
const router = useRouter();

const columns = reactive([
  { type: "selection", label: "", width: 80 },
  { type: "index", label: "序号", width: 80 },
  { prop: "submitRequestIp", label: "回答IP", align: "left" },
  {
    prop: "completeTime",
    label: "完成时间/秒",
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
  { prop: "operation", label: "操作" }
]);
const treeFilterValues = reactive({ pageNum: 1, pageSize: 20 });
const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total
  };
};

const getTableList = (params: any) => {
  params.projectKey = key;
  const newParams = JSON.parse(JSON.stringify(params)); // 深拷贝（可选）
  if (Array.isArray(newParams.createTime) && newParams.createTime.length === 2) {
    newParams.beginDateTime = newParams.createTime[0];
    newParams.endDateTime = newParams.createTime[1];
    delete newParams.createTime;
  }
  return getAnswerList(newParams);
};

const showDetail = (data: any) => {
  const projectKey = data.projectKey;
  router.push({ path: "/questionnaire/surverResult", query: { projectKey } });
};
const exportFile = async () => {
  const res = await exportAnswerResult(key);
  console.log(res);
};
</script>

<style scoped lang="scss">
.answer_view {
  height: calc(100vh - 170px);
  background-color: #f6f8f8;
  :deep(.table-search) {
    // border: none;
    margin: 10px 12px;
  }
  :deep(.table-main) {
    width: auto;
    margin: 10px 12px;
    margin-top: 0;
  }
}
</style>
