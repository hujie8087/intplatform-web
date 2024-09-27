<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        :columns="columns"
        :request-api="getDeptList"
        :pagination="false"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 4, xl: 4 }"
        row-key="deptId"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader>
          <el-button type="primary" v-auth="['system:dept:add']" :icon="CirclePlus" @click="openDrawer('新增')"
            >新增部门</el-button
          >
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="success" v-auth="['system:dept:edit']" link :icon="EditPen" @click="openDrawer('编辑', scope.row)"
            >编辑</el-button
          >
          <el-button type="primary" v-auth="['system:dept:add']" link :icon="Plus" @click="openDrawer('新增', scope.row)"
            >新增</el-button
          >
          <el-button
            type="danger"
            v-auth="['system:dept:remove']"
            v-if="scope.row.deptId !== 100"
            link
            :icon="Delete"
            @click="deleteDeptHandle(scope.row)"
          >
            删除
          </el-button>
        </template>
      </ProTable>
    </div>
    <DeptDrawer ref="drawerRef" />
  </div>
</template>
<script setup lang="ts" name="departmentManage">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import DeptDrawer from "./components/DeptDrawer.vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, Plus } from "@element-plus/icons-vue";
import { getDeptList, deleteDept, editDept, addDept, getDeptById, listDeptExcludeChild } from "@/api/modules/system/dept";
import { Dept } from "@/api/interface/system";
import { handleTree } from "@/utils";
import { userStatus } from "@/utils/serviceDict";

// ProTable 实例
const proTable = ref<ProTableInstance>();

const dataCallback = (data: any) => {
  return handleTree(data.data, "deptId");
};
// 表格配置项
const columns = reactive<ColumnProps<Dept.ResDept>[]>([
  { prop: "deptName", label: "部门名称", search: { el: "input" }, align: "left" },
  { prop: "orderNum", label: "排序", width: 120 },
  {
    prop: "status",
    label: "状态",
    width: 120,
    sortable: true,
    tag: true,
    enum: userStatus,
    search: { el: "select" }
  },
  { prop: "createTime", label: "创建时间", width: 180 },
  { prop: "operation", label: "操作", width: 330, fixed: "right" }
]);
const deptOptions = ref<Dept.ResDept[]>([]);
// 删除用户信息
const deleteDeptHandle = async (params: Dept.ResDept) => {
  await useHandleData(deleteDept, params.deptId, `删除【${params.deptName}】部门`);
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof DeptDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Dept.ResDept> = {}) => {
  if (row.deptId) {
    const res = await getDeptById(row.deptId);
    row = res.data;
  }
  if (title === "编辑" && row.deptId) {
    const res = await listDeptExcludeChild(row.deptId);
    deptOptions.value = handleTree(res.data, "deptId");
  }
  if (title === "新增") {
    const res = await getDeptList({ pageNum: 1, pageSize: 1000 });
    deptOptions.value = handleTree(res.data, "deptId");
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: title === "新增" ? { parentId: row.parentId } : row,
    api: title === "新增" ? addDept : title === "编辑" ? editDept : undefined,
    getTableList: proTable.value?.getTableList,
    deptOptions: deptOptions.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
