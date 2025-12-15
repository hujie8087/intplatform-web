<template>
  <div class="main-box">
    <div class="table-box">
      <!-- 表格内容 card -->
      <div class="card table">
        <!-- 表格头部 操作按钮 -->
        <div class="table-header">
          <div class="header-button-lf">
            <el-button type="primary" :icon="CirclePlus" @click="openDrawer(1)">新增</el-button>
            <el-button
              type="danger"
              :icon="Delete"
              plain
              @click="batchDelete(multipleSelection)"
              :disabled="!multipleSelection.length"
            >
              批量删除
            </el-button>
          </div>
        </div>
        <!-- 表格主体 -->
        <el-table
          ref="tableRef"
          :data="tableData"
          row-key="id"
          lazy
          :load="load"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          @selection-change="selectionChange"
        >
          <!-- selection || index -->
          <el-table-column type="selection" width="55" />
          <el-table-column prop="title" label="名称" />
          <el-table-column prop="code" label="编码" />
          <el-table-column prop="sort" label="排序" />
          <el-table-column label="操作">
            <!-- 表格操作 -->
            <template #default="scope">
              <el-button type="primary" link :icon="Plus" @click="openDrawer(2, scope.row)"> 新增 </el-button>
              <el-button type="warning" link :icon="EditPen" @click="openDrawer(3, scope.row)"> 编辑 </el-button>
              <el-button type="danger" link :icon="Delete" @click="deleteAccount(scope.row)"> 删除 </el-button>
            </template>
          </el-table-column>
          <!-- 表格无数据情况 -->
          <template #empty>
            <div class="table-empty">
              <slot name="empty">
                <img src="@/assets/images/notData.png" alt="notData" />
                <div>{{ $t("main.noData") }}</div>
              </slot>
            </div>
          </template>
        </el-table>
      </div>
      <BuildingDrawer ref="drawerRef" />
    </div>
  </div>
</template>

<script setup lang="tsx" name="DormitoryBuilding">
import { ref } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import BuildingDrawer from "./components/BuildingDrawer.vue";
import { CirclePlus, Delete, EditPen, Plus } from "@element-plus/icons-vue";
import {
  deleteBuilding,
  deleteMoreBuilding,
  editBuilding,
  addBuilding,
  getBuildingTree,
  getBuildingById
} from "@/api/modules/productDisplay/building";
import { useI18n } from "vue-i18n";
import { Building } from "@/api/interface/productDisplay/building";
import { BuildingStore } from "@/stores/modules/building";
import { findChildrenById } from "@/utils/index";
const { t } = useI18n(); // 解构出t方法

const maps = new Map();
const buildingStore = BuildingStore();
const tableData = ref();
const tableRef = ref();
// 如果你想在请求之前对当前请求参数做一些操作，可以自定义如下函数：params 为当前所有的请求参数（包括分页），最后返回请求列表接口
// 默认不做操作就直接在 ProTable 组件上绑定	:requestApi="getBuildingList"
const getTableList = async () => {
  const { data } = await getBuildingTree();
  buildingStore.setAllBuildingButtonList(data);
  const newData = findChildrenById(0, data);
  tableData.value = [...(newData || [])];
  tableRef.value.$forceUpdate();
};
const multipleSelection = ref<number[]>([]);
const selectionChange = (val: Building.ResBuilding[]) => {
  multipleSelection.value = val.map(item => item.id);
};

// 删除楼栋信息
const deleteAccount = async (params: Building.ResBuilding) => {
  await useHandleData(deleteBuilding, params.id, t("main.deleteMsg", { msg: params.title, title: "楼栋" }));
  // getTableList();
  tableRef.value.$forceUpdate();
  refreshLoadTree(params.pid);
};

// 批量删除楼栋信息
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteMoreBuilding, ids, t("main.deleteBatchMsg", { title: "楼栋" }));
  getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref();
const openDrawer = async (num: number, rowData: Partial<Building.ResBuilding> = {}) => {
  let title;
  switch (num) {
    case 1:
      title = t("main.add");
      rowData = { pid: 0 };
      break;
    case 2:
      title = t("main.add");
      rowData = { pid: rowData.id ? rowData.id : 0 };
      break;
    case 3:
      title = t("main.edit");
      const { data } = await getBuildingById(rowData.id!);
      rowData = data;
      break;
    default:
      break;
  }

  let params = {
    title,
    rowData: { ...rowData },
    tableData: tableData,
    isView: false,
    isAdd: num === 1 || num === 2,
    api: num !== 3 ? addBuilding : editBuilding,
    getTableList: getTableList,
    refreshLoadTree: refreshLoadTree
  };
  drawerRef.value.acceptParams(params);
};
// 更新楼栋树指定节点
const refreshLoadTree = async (parentId: number) => {
  await getTableList();
  if (maps.get(parentId)) {
    const { tree, treeNode, resolve } = maps.get(parentId);
    load(tree, treeNode, resolve);
    if (tree.parentId) {
      const a = maps.get(tree.parentId);
      load(a.tree, a.treeNode, a.resolve);
    }
  }
};
const load = async (row: Building.ResBuilding, treeNode: unknown, resolve: (date: Building.ResBuilding[]) => void) => {
  try {
    const data = findChildrenById(row.id, buildingStore.allBuildingList)?.map(item => ({
      ...item,
      hasChildren: !item.hasChildren
    }));
    resolve(data || []);
    maps.set(row.id, { tree: row, treeNode, resolve });
  } catch (error) {
    console.error("加载子节点失败:", error);
    resolve([]);
  }
};
getTableList();
</script>
