<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}报警历史记录`" width="80%">
    <ProTable
      ref="proTable"
      highlight-current-row
      :columns="columns"
      :request-api="listAlarm"
      :data-callback="dataCallback"
      :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
      row-key="id"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <!-- 导出 -->
        <el-button type="warning" :icon="Download" @click="downloadFile"> 导出报警历史记录 </el-button>
        <el-button type="danger" :disabled="!scope.isSelected" :icon="Delete" @click="batchDelete(scope.selectedListIds)">
          批量删除
        </el-button>
      </template>
      <template #operation="">
        <el-button type="primary" link :icon="View">查看</el-button>
        <el-button type="danger" link :icon="Delete"> 删除 </el-button>
      </template>
    </ProTable>
    <template #footer>
      <el-button type="primary" @click="drawerVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="AlarmRecords">
import { ref } from "vue";
import { Delete, Download, View } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance } from "@/components/ProTable/interface";
import { listAlarm } from "@/api/modules/sosAlart/index";

const baseUrl = import.meta.env.VITE_API_URL;
const proTable = ref<ProTableInstance>();
const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total,
    current: data.current,
    size: data.size
  };
};
const columns = [
  {
    label: "报警人",
    prop: "reportBy",
    width: 120
  },
  {
    label: "报警时间",
    prop: "reportTime",
    width: 140
  },
  {
    label: "报警地点",
    prop: "reportLocation"
  },
  {
    label: "报警详情",
    prop: "reportDescription"
  },
  {
    label: "处理时间",
    prop: "processingTime",
    width: 140
  },
  {
    label: "处理结果",
    prop: "processingResult",
    width: 120
  },
  {
    label: "处理人",
    prop: "processingBy",
    width: 120
  },
  {
    label: "处理备注",
    prop: "remark",
    width: 120
  },

  {
    label: "操作",
    prop: "operation",
    width: 200,
    fixed: "right"
  }
];
interface DrawerProps {
  title: string;
}
// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: ""
});

const batchDelete = (ids: number[]) => {
  console.log(ids);
};
const downloadFile = () => {
  window.open(baseUrl + "/maintenance/report/export", "_blank");
};
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

defineExpose({
  acceptParams
});
</script>
