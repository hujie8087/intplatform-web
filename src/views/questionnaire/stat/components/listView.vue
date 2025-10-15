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
          <el-button type="warning" :icon="Download" @click="exportFile">{{ $t("main.download") }}</el-button>
        </template>
        <template #operation="scope">
          <el-tooltip placement="top" effect="dark" :content="$t('main.view')">
            <el-button link type="success" :icon="View" @click="showDetail(scope.row)" />
          </el-tooltip>
        </template>
      </ProTable>
    </div>
  </div>
</template>

<script setup lang="tsx" name="listView">
import { reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { getAnswerList, exportAnswerResult } from "@/api/modules/questionnaire/answer";
import { View, Download } from "@element-plus/icons-vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const route = useRoute();
const key = route.query.key as string;
const router = useRouter();
const { t } = useI18n();

const columns = reactive([
  { type: "selection", label: "", width: 80 },
  { prop: "serialNumber", label: "survey.stat.orderNo", width: 120, align: "center" },
  { prop: "submitRequestIp", label: "survey.stat.ipAddress", align: "left" },
  {
    prop: "completeTime",
    label: "survey.stat.completedTime",
    align: "left"
  },
  {
    prop: "submitOs",
    label: "survey.stat.source",
    align: "left",
    render: scope => {
      let submitOs = scope.row.submitOs;
      let submitBrowser = scope.row.submitBrowser;
      return (
        <span>
          {submitOs} / {submitBrowser}
        </span>
      );
    }
  },
  {
    prop: "createTime",
    sortable: true,
    search: {
      el: "date-picker",
      span: 2,
      props: {
        type: "datetimerange",
        startPlaceholder: t("main.startTime"),
        endPlaceholder: t("main.endTime"),
        rangeSeparator: t("main.to"),
        valueFormat: "YYYY-MM-DD HH:mm:ss"
      }
    },
    label: "survey.stat.submitTime",
    align: "left"
  },
  { prop: "operation", label: "main.operation" }
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
  const id = data.id;
  router.push({ path: "/questionnaire/surverResult", query: { projectKey, id } });
};
const exportFile = async () => {
  const res = await exportAnswerResult(key);
  let fileName = "答卷完成情况.xlsx";
  const blob = new Blob([res], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
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
