<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      title="菜单列表"
      row-key="path"
      :indent="20"
      :columns="columns"
      :request-api="getMenuList"
      :data-callback="dataCallback"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader>
        <el-button type="primary" :icon="CirclePlus" @click="openDrawer(1)">新增菜单 </el-button>
      </template>
      <!-- 菜单图标 -->
      <template #icon="scope">
        <el-icon :size="18" v-if="scope.row.icon && scope.row.icon !== '#'">
          <component :is="scope.row.icon"></component>
        </el-icon>
      </template>
      <!-- 菜单操作 -->
      <template #operation="scope">
        <el-button type="success" link :icon="EditPen" @click="openDrawer(3, scope.row)"> 编辑 </el-button>
        <el-button type="primary" link :icon="Plus" @click="openDrawer(2, scope.row)"> 新增 </el-button>
        <el-button type="danger" link :icon="Delete" @click="deleteAccount(scope.row)"> 删除 </el-button>
      </template>
    </ProTable>
    <!-- 新增、编辑、查看 -->
    <MenuDrawer ref="drawerRef" />
  </div>
</template>

<script setup lang="ts" name="menuMange">
import { ref } from "vue";
import { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import { Delete, EditPen, CirclePlus, Plus } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import MenuDrawer from "./components/MenuDrawer.vue";
import { deleteMenu, getMenuById, getMenuList } from "@/api/modules/user";
import { handleTree } from "@/utils";
import { reactive } from "vue";
import { useI18n } from "vue-i18n";
import { editMenu, addMenu } from "@/api/modules/user";
import { useHandleData } from "@/hooks/useHandleData";
import { Menu } from "@/api/interface/system";
import { visibleType } from "@/utils/serviceDict";
const { t } = useI18n(); // 解构出t方法

const proTable = ref<ProTableInstance>();
const tableData = ref();
// const getMenuListData = async () => {
//   const { data } = await getMenuList();
//   tableData.value = handleTree(data, "menuId");
// };
const dataCallback = (data: any) => {
  tableData.value = handleTree(data.data, "menuId");
  return {
    list: tableData.value,
    total: tableData.value.length,
    current: data.current,
    size: data.size
  };
};
// 表格配置项
const columns = reactive<ColumnProps<Menu.MenuOptions>[]>([
  { prop: "menuName", label: "菜单名称", align: "left", search: { el: "input" } },
  {
    prop: "icon",
    label: "菜单图标",
    width: 120
  },
  { prop: "orderNum", label: "排序", width: 80 },
  { prop: "path", label: "菜单路径", search: { el: "input" } },
  { prop: "component", label: "组件路径" },
  { prop: "perms", label: "权限标记" },
  { prop: "status", label: "显示状态", width: 100, tag: true, enum: visibleType },
  { prop: "operation", label: "操作", width: 250, fixed: "right" }
]);

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref();
const openDrawer = async (num: number, rowData: Partial<Menu.ResMenu> = {}) => {
  let menuInfo = {};
  let title;
  switch (num) {
    case 1:
      title = t("main.add");
      break;
    case 2:
      title = t("main.add");
      break;
    case 3:
      title = t("main.edit");
      break;
    default:
      break;
  }
  if (num === 3) {
    const { data } = await getMenuById(rowData.menuId as number);
    menuInfo = data;
  } else if (num === 2) {
    menuInfo = { parentId: rowData.menuId, id: 0 };
  }
  let params = {
    title,
    rowData: { ...menuInfo },
    isView: false,
    api: num === 3 ? editMenu : addMenu,
    getTableList: proTable.value!.getTableList,
    menuOptions: [{ menuId: 0, menuName: "主目录", children: tableData.value }]
  };
  drawerRef.value.acceptParams(params);
};
// 删除菜单信息
const deleteAccount = async (params: Menu.ResMenu) => {
  await useHandleData(deleteMenu, params.menuId, t("main.deleteMsg", { msg: params.menuName, title: t("system.menu.menu") }));
  proTable.value?.getTableList();
};
// getMenuListData();
</script>
