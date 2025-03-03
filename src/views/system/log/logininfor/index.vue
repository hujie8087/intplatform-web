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
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="danger" :disabled="!scope.isSelected" :icon="Delete" @click="batchDelete(scope.selectedListIds)">
            批量删除登录日志
          </el-button>
          <el-button type="warning" :icon="Delete" @click="cleanLoginLogHandle">清空登录日志</el-button>
          <el-button type="success" :icon="Download" plain @click="downloadFile">导出登录日志数据</el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <!-- 解锁 -->
          <el-button type="warning" link :icon="Unlock" @click="unlockUserHandle(scope.row)">解锁</el-button>
          <el-button type="danger" link :icon="Delete" @click="deleteLoginLogHandle(scope.row)">删除</el-button>
        </template>
      </ProTable>
    </div>
  </div>
</template>
<script setup lang="tsx" name="LoginInfo">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Delete, Download, Unlock } from "@element-plus/icons-vue";
import { getLoginLogList, deleteLoginLog, cleanLoginLog, unlockUser } from "@/api/modules/system/log";
import { LoginLog } from "@/api/interface/system";
import { useI18n } from "vue-i18n";
import { ElMessageBox } from "element-plus";
import { useDownload } from "@/hooks/useDownload";
import { DictOptions } from "@/api/interface";
const { t } = useI18n(); // 解构出t方法

// ProTable 实例
const proTable = ref<ProTableInstance>();
const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total
  };
};

const sys_loginlog_status = ref<DictOptions[]>([
  { label: "成功", value: 0, tagType: "success" },
  { label: "失败", value: 1, tagType: "danger" }
]);

const getProTableData = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  return getLoginLogList(newParams);
};

// 表格配置项
const columns = reactive<ColumnProps<LoginLog.ResLoginLog>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "title", label: "标题", width: 120 },
  { prop: "operId", label: "访问编号", width: 80 },
  { prop: "operName", label: "用户名称", search: { el: "input", tooltip: "请输入用户名称" } },
  { prop: "nickName", label: "姓名", search: { el: "input", tooltip: "请输入姓名" } },
  { prop: "deptName", label: "部门名称", search: { el: "input", tooltip: "请输入部门" } },
  { prop: "operIp", label: "ip地址", search: { el: "input", tooltip: "请输入ip地址" } },
  { prop: "requestMethod", label: "请求方式" },
  { prop: "loginLocation", label: "登录地点" },
  { prop: "status", label: "登录状态", enum: sys_loginlog_status, tag: true, search: { el: "select" } },
  { prop: "msg", label: "登录信息" },
  {
    prop: "operTime",
    label: "登录时间",
    width: 180,
    sortable: true,
    search: { el: "date-picker", span: 2, props: { type: "datetimerange", valueFormat: "YYYY-MM-DD HH:mm:ss" } }
  },
  { prop: "operation", label: "操作", width: 160, fixed: "right" }
]);

// 删除系统日志
const deleteLoginLogHandle = async (params: LoginLog.ResLoginLog) => {
  await useHandleData(deleteLoginLog, params.infoId, `删除【${params.userName}】登录日志`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteLoginLog, ids.join(","), t("main.deleteBatchMsg", { title: t("system.config.configName") }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 清空系统日志
const cleanLoginLogHandle = async () => {
  await useHandleData(cleanLoginLog, null, "清空系统日志");
  proTable.value?.getTableList();
};

// 导出系统日志
const downloadFile = async () => {
  ElMessageBox.confirm("确认导出系统日志数据?", "温馨提示", { type: "warning" }).then(() =>
    useDownload("api/system/loginlog/export", "系统日志列表", true, ".xlsx", "post", proTable.value?.searchParam)
  );
};

// 解锁用户
const unlockUserHandle = async (params: LoginLog.ResLoginLog) => {
  await useHandleData(unlockUser, { userId: params.infoId }, `解锁【${params.userName}】用户`);
  proTable.value?.getTableList();
};
</script>
