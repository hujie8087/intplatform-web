<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}`" width="80%">
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
      <template #tableHeader>
        <!-- 导出 -->
        <el-button type="warning" :icon="Download" @click="downloadFile"> 导出报警历史记录 </el-button>
      </template>
      <template #operation="scope">
        <el-button type="primary" link :icon="View">查看</el-button>
        <!-- 查看聊天记录 -->
        <el-button type="warning" link :icon="ChatDotRound" @click="openChatForAlarm(scope.row)"> 查看聊天记录 </el-button>
      </template>
    </ProTable>
    <template #footer>
      <el-button type="primary" @click="drawerVisible = false">关闭</el-button>
    </template>
  </el-dialog>
  <AlarmChat ref="alarmChat" />
</template>

<script setup lang="tsx" name="AlarmRecords">
import { ref } from "vue";
import AlarmChat from "./AlarmChat.vue";
import { ChatDotRound, Download, View } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, RenderScope } from "@/components/ProTable/interface";
import { listAlarm } from "@/api/modules/sosAlart/index";
import { useDownload } from "@/hooks/useDownload";

interface AlarmData {
  createBy: string;
  delFlag: string;
  deviceType: string;
  id: number;
  latitude: number;
  level: number;
  longitude: number;
  orderNo: string;
  params: any;
  processingBy: string;
  processingResult: string;
  reportBy: string;
  reportDescription: string;
  reportLocation: string;
  reportTime: string;
  systemSource: number;
  tel: string;
}
const baseUrl = import.meta.env.VITE_API_URL;
const alarmChat = ref<InstanceType<typeof AlarmChat>>();
const proTable = ref<ProTableInstance>();
const dataCallback = (data: any) => {
  console.log(data);
  return {
    list: data.rows,
    total: data.total,
    current: data.current,
    size: data.size
  };
};
const emit = defineEmits<{
  alarmClick: [alarm: AlarmData];
}>();
const locationClick = row => {
  drawerVisible.value = false;
  emit("alarmClick", row);
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
    prop: "reportLocation",
    render: (scope: RenderScope<AlarmData>) => {
      return (
        <el-link underline onClick={() => locationClick(scope.row)}>
          {scope.row.reportLocation}
        </el-link>
      );
    }
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

const downloadFile = () => {
  useDownload(`${baseUrl}/maintenance/report/export`, "报警历史记录", true, ".xlsx", "post", proTable.value?.searchParam);
};

// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

const openChatForAlarm = async (alarm: any) => {
  alarmChat.value?.acceptParams({ alarm });
};

defineExpose({
  acceptParams
});
</script>
