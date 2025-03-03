<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getProTableData"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="operId"
      >
        <!-- 表格操作 -->
        <template #operation="{ row }">
          <!-- 强制下线 -->
          <el-button type="danger" link @click="handleForceOffline(row)">强制下线</el-button>
        </template>
      </ProTable>
    </div>
  </div>
</template>
<script setup lang="tsx" name="OperaLog">
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { forceOffline, getOnlineList } from "@/api/modules/monitor/online";
import { Online } from "@/api/interface/monitor";
import dayjs from "dayjs";
import { useHandleData } from "@/hooks/useHandleData";

// ProTable 实例
const proTable = ref<ProTableInstance>();
const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total
  };
};

const getProTableData = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  return getOnlineList(newParams);
};

// 表格配置项
const columns = reactive<ColumnProps<Online.ResOnline>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "tokenId", label: "tokenId", width: 300 },
  { prop: "userName", label: "用户名称", search: { el: "input", tooltip: "请输入用户名称" } },
  { prop: "ipaddr", label: "ip地址", search: { el: "input", tooltip: "请输入ip地址" } },
  {
    prop: "loginTime",
    label: "登录时间",
    width: 180,
    sortable: true,
    search: { el: "date-picker", span: 2, props: { type: "datetimerange", valueFormat: "YYYY-MM-DD HH:mm:ss" } },
    render: scope => {
      return dayjs(scope.row.loginTime).format("YYYY-MM-DD HH:mm:ss");
    }
  },
  { prop: "loginLocation", label: "登录地点" },
  { prop: "browser", label: "浏览器" },
  { prop: "os", label: "操作系统" },
  { prop: "operation", label: "操作", width: 100, fixed: "right" }
]);

// 强制下线
const handleForceOffline = async (row: Online.ResOnline) => {
  await useHandleData(forceOffline, { tokenId: row.tokenId }, `强制下线【${row.userName}】用户`);
  proTable.value?.getTableList();
};
</script>
