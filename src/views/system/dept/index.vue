<template>
  <div class="main-box">
    <div class="table-box card">
      <el-table
        :data="deptData"
        style="width: 100%"
        row-key="id"
        border
        lazy
        :load="load"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="name" label="部门名称" />
        <el-table-column prop="code" label="组织编码" align="center" />
        <el-table-column prop="dimensionCode" label="维度编码" align="center" />
        <el-table-column prop="formatName" label="格式化名称" align="center" />
        <el-table-column prop="sort" label="排序" align="center" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">{{ scope.row.status === 1 ? "启用" : "禁用" }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operation" label="操作" width="250" fixed="right" align="center">
          <template #default="scope">
            <el-button type="warning" link :icon="EditPen" @click="openDrawer(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <DeptDrawer ref="drawerRef" />
  </div>
</template>
<script setup lang="ts" name="departmentManage">
import { ref } from "vue";
import DeptDrawer from "./components/DeptDrawer.vue";
import { getOrganizeTree, getOrganizeChildren, getOrganizeById, updateOrganize } from "@/api/modules/organize";
import { Organize } from "@/api/interface/organize";
import { EditPen } from "@element-plus/icons-vue";
import { handleTree } from "@/utils";

const organizeTreeList = ref<{ label: string; value: number; pid: number; isLeaf: boolean; children?: any[] }[]>([]);
const deptData = ref<Organize.ResOrganize[]>([]);
const getDeptList = () => {
  getOrganizeTree({
    dimensionCode: "iwip"
  }).then(res => {
    deptData.value = res.data.map(item => {
      return {
        ...item,
        children: [],
        hasChildren: true
      };
    });
    const flatList = res.data.map(item => {
      return {
        label: item.name,
        value: item.id,
        formatName: item.formatName,
        pid: item.pid,
        isLeaf: item.formatName.indexOf("/") === -1
      };
    });
    organizeTreeList.value = [
      {
        label: "根节点",
        value: 0,
        pid: 0,
        isLeaf: false,
        children: handleTree(flatList, "value", "pid")
      }
    ];
  });
};
getDeptList();
const load = (row: any, treeNode: any, resolve: any) => {
  getOrganizeChildren(row.id).then(res => {
    resolve(
      res.data.map(item => {
        return {
          ...item,
          children: [],
          hasChildren: true
        };
      })
    );
  });
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof DeptDrawer> | null>(null);
const openDrawer = async (row: Partial<Organize.ResOrganize> = {}) => {
  if (row.id) {
    const res = await getOrganizeById(row.id);
    row = res.data;
  }
  const params = {
    title: "编辑",
    isView: false,
    rowData: row,
    api: updateOrganize,
    getTableList: getDeptList,
    organizeTreeList: organizeTreeList.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
