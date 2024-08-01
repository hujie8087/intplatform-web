<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getComplaintTypeList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" v-auth="['other:show:add']" :icon="CirclePlus" @click="openDrawer('新增')"> 新增 </el-button>
          <el-button
            type="danger"
            v-auth="['other:show:delete']"
            :disabled="!scope.isSelected"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除
          </el-button>
          <el-button type="warning" :icon="Download" plain @click="downloadFile">导出用户数据</el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="success" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="primary" link :icon="Edit" v-auth="['other:show:edit']" @click="openDrawer('编辑', scope.row)">
            编辑
          </el-button>
          <el-button type="danger" link :icon="Delete" v-auth="['other:show:delete']" @click="deleteComplaintHandle(scope.row)">
            删除
          </el-button>
        </template>
      </ProTable>
    </div>
    <ComplaintTypeDrawer ref="drawerRef" />
  </div>
</template>
<script setup lang="tsx" name="ComplaintType">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, Download, Edit, View } from "@element-plus/icons-vue";
import {
  getComplaintTypeList,
  deleteComplaintType,
  getComplaintTypeById,
  addComplaintType,
  editComplaintType
} from "@/api/modules/service/complaint";
import { Complaint } from "@/api/interface/service/complaint";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import { useDict } from "@/hooks/useDict";
import ComplaintTypeDrawer from "./components/ComplaintTypeDrawer.vue";
import { ElMessageBox } from "element-plus";
import { useDownload } from "@/hooks/useDownload";

const { t } = useI18n(); // 解构出t方法
// 字典数据
const complaintTypeStatusOptions = ref<DictOptions[]>([]);
useDict("sys_normal_disable").then(res => {
  complaintTypeStatusOptions.value = res.sys_normal_disable;
});
// ProTable 实例
const proTable = ref<ProTableInstance>();
const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total,
    current: data.current,
    size: data.size
  };
};
// 表格配置项
const columns = reactive<ColumnProps<Complaint.ResComplaint>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 50 },
  {
    prop: "name",
    label: "类型名称",
    search: { el: "input" }
  },
  {
    prop: "status",
    label: "状态",
    enum: complaintTypeStatusOptions,
    sortable: true,
    tag: true,
    search: { el: "select", props: { filterable: true } },
    width: 100
  },
  {
    prop: "remark",
    label: "备注"
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除报修记录
const deleteComplaintHandle = async (params: Complaint.ResComplaint) => {
  await useHandleData(deleteComplaintType, params.id, `删除内容`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteComplaintType, ids, t("main.deleteBatchMsg", { title: "内容" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof ComplaintTypeDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Complaint.ResComplaint> = {}) => {
  if (row.id) {
    const res = await getComplaintTypeById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addComplaintType : title === "编辑" ? editComplaintType : undefined,
    getTableList: proTable.value?.getTableList,
    complaintTypeStatusOptions: complaintTypeStatusOptions.value
  };
  drawerRef.value?.acceptParams(params);
};

// 导出投诉与建议类型列表
const downloadFile = async () => {
  ElMessageBox.confirm("确认导出投诉与建议类型数据?", "温馨提示", { type: "warning" }).then(() =>
    useDownload(
      "intplatform-stage-api/other/ComplaintType/export",
      "投诉与建议类型列表",
      true,
      ".xlsx",
      "post",
      proTable.value?.searchParam
    )
  );
};
</script>
