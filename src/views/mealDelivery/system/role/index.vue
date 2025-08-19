<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        :title="roleList"
        :columns="columns"
        :request-api="getTableList"
        :data-callback="dataCallback"
        :init-param="initParam"
        :page-size="[50, 100, 200, 300]"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" v-auth="['system:role:add']" :icon="CirclePlus" @click="openDrawer(1)">{{
            $t("system.role.add")
          }}</el-button>
          <el-button
            type="danger"
            v-auth="['system:role:reomve']"
            :icon="Delete"
            plain
            @click="batchDelete(scope.selectedListIds)"
            :disabled="!scope.isSelected"
          >
            {{ $t("system.role.batchDelete") }}
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button
            type="warning"
            v-auth="['system:role:edit']"
            link
            v-if="scope.row.roleId !== 1"
            :icon="EditPen"
            @click="openDrawer(3, scope.row)"
            >{{ $t("main.edit") }}</el-button
          >
          <el-button
            type="danger"
            v-auth="['system:role:remove']"
            link
            v-if="scope.row.roleId !== 1"
            :icon="Delete"
            @click="deleteAccount(scope.row)"
            >{{ $t("main.delete") }}</el-button
          >
          <el-dropdown v-auth="['system:role:edit']" style="display: inline-block; vertical-align: middle">
            <el-button type="success" link :icon="DArrowRight">更多</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-button type="primary" link :icon="Refresh" @click="handleDataScope(scope.row)">数据权限</el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button type="primary" link :icon="CircleCheck" @click="handleAuthUser(scope.row)">分配用户</el-button>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </ProTable>
      <RoleDrawer ref="drawerRef" />
      <DataRoleDrawer ref="dataDrawerRef" />
      <AuthUserDrawer ref="authUserDrawerRef" />
    </div>
  </div>
</template>

<script setup lang="tsx" name="mdcRoleManage">
import { ref, reactive, computed } from "vue";
import { Role } from "@/api/interface/mealDelivery/system/role";
import { ColumnProps } from "@/components/ProTable/interface";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import RoleDrawer from "./components/RoleDrawer.vue";
import DataRoleDrawer from "./components/DataDrawer.vue";
import AuthUserDrawer from "./components/AuthUserDrawer.vue";
import { CircleCheck, CirclePlus, DArrowRight, Delete, EditPen, Refresh } from "@element-plus/icons-vue";
import {
  delRole,
  updateRole,
  addRole,
  listRole,
  getRole,
  roleMenuTreeSelect,
  dataScope,
  roleDeptTreeSelect
} from "@/api/modules/mdc/system/role";
import { useI18n } from "vue-i18n";
import { Menu } from "@/api/interface/mealDelivery/system/menu";
import { treeselect } from "@/api/modules/mdc/system/menu";
import { DictOptions } from "@/api/interface";
import { useDict } from "@/hooks/useDict";
import { queryAllMessHallNameList } from "@/api/modules/mdc/system/order/messHall";
import { queryAllCarNameList } from "@/api/modules/mdc/system/order/carInfo";
import { queryAllSiteNameList } from "@/api/modules/mdc/system/order/site";
import { queryCompanyOptionList } from "@/api/modules/mdc/system/company";
const { t } = useI18n(); // 解构出t方法
// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTable = ref();
const roleList = computed(() => t("system.role.roleList"));
// 如果表格需要初始化请求参数，直接定义传给 ProTable(之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({ pageSize: 50 });
// dataCallback 是对于返回的表格数据做处理，如果你后台返回的数据不是 list && total && pageNum && pageSize 这些字段，那么你可以在这里进行处理成这些字段
// 或者直接去 hooks/useTable.ts 文件中把字段改为你后端对应的就行

const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total,
    current: data.current,
    size: data.size
  };
};

const roleStatus = ref<DictOptions[]>([]);
useDict("sys_normal_disable").then(res => {
  roleStatus.value = res.sys_normal_disable;
});

// 如果你想在请求之前对当前请求参数做一些操作，可以自定义如下函数：params 为当前所有的请求参数（包括分页），最后返回请求列表接口
// 默认不做操作就直接在 ProTable 组件上绑定	:requestApi="getRoleList"
const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  newParams.username && (newParams.username = "custom-" + newParams.username);
  console.log(newParams);
  return listRole(newParams);
};

// 页面按钮权限（按钮权限既可以使用 hooks，也可以直接使用 v-auth 指令，指令适合直接绑定在按钮上，hooks 适合根据按钮权限显示不同的内容）
// const { BUTTONS } = useAuthButtons();
const columns = computed((): ColumnProps<Role.ResRole>[] => [
  { type: "selection", fixed: "left", width: 50 },
  {
    prop: "roleName",
    label: "system.role.name",
    search: { el: "input" }
  },
  // 多级 prop
  {
    prop: "roleKey",
    label: "system.role.roleKey",
    search: { el: "input" }
  },
  { prop: "roleSort", label: "system.role.sort", width: 100 },
  {
    prop: "status",
    label: "system.role.status",
    enum: roleStatus,
    sortable: true,
    tag: true,
    width: 100,
    search: { el: "select" }
  },
  { prop: "createTime", label: "main.createTime", width: 160 },
  { prop: "operation", label: "main.operation", fixed: "right", width: 200 }
]);

// 删除角色信息
const deleteAccount = async (params: Role.ResRole) => {
  await useHandleData(delRole, params.roleId, t("main.deleteMsg", { msg: params.roleName }));
  proTable.value.getTableList();
};

// 批量删除角色信息
const batchDelete = async (ids: number[]) => {
  await useHandleData(delRole, ids.join(","), t("main.deleteBatchMsg"));
  proTable.value.clearSelection();
  proTable.value.getTableList();
};

const roleMenuTree = ref<Menu.ResMenu[]>([]);
const menuIds = ref<number[]>([]);
const getRoleMenuTreeSelect = async (roleId: number) => {
  const res = await roleMenuTreeSelect(roleId);
  roleMenuTree.value = res.menus;
  menuIds.value = res.checkedKeys;
};

const getMenuTreeList = async () => {
  const res = await treeselect();
  roleMenuTree.value = res.data;
};

// 根据角色ID获取部门数据
const deptOptions = ref<any[]>([]);
const getDeptTree = async (roleId: number) => {
  const res = await roleDeptTreeSelect(roleId);
  deptOptions.value = res.depts;
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref();
const openDrawer = async (num: number, rowData: Partial<Role.ResRole> = {}) => {
  let roleInfo = {};
  let title;
  switch (num) {
    case 1:
      title = t("main.add");
      break;
    case 2:
      title = t("main.view");
      break;
    case 3:
      title = t("main.edit");
      break;
    default:
      break;
  }
  if (num !== 1) {
    const { data } = await getRole(rowData.roleId as number);
    roleInfo = data;
    await getRoleMenuTreeSelect(rowData.roleId as number);
  } else {
    await getMenuTreeList();
    menuIds.value = [];
  }
  let params = {
    title,
    rowData: { ...roleInfo },
    isView: num === 2,
    api: num === 1 ? addRole : num === 3 ? updateRole : "",
    getTableList: proTable.value.getTableList,
    menuList: roleMenuTree.value,
    menuIds: menuIds.value
  };
  drawerRef.value.acceptParams(params);
};

// 获取食堂列表
const messHallList = ref<any[]>([]);
const getMessHallList = async () => {
  const res = await queryAllMessHallNameList();
  messHallList.value = res.data;
};
getMessHallList();
/** 查询车队结构 */
const carOptions = ref<any[]>([]);
const getCarOptions = async () => {
  const res = await queryAllCarNameList();
  carOptions.value = res.data;
};
getCarOptions();
const siteOptions = ref<any[]>([]);
const getSiteOptions = async () => {
  const res = await queryAllSiteNameList();
  siteOptions.value = res.data;
};
getSiteOptions();
const companyOptions = ref<any[]>([]);
const getCompanyOptions = async () => {
  const res = await queryCompanyOptionList();
  companyOptions.value = res.data;
};
getCompanyOptions();

const dataDrawerRef = ref();
const handleDataScope = async (rowData: Role.ResRole) => {
  let roleInfo = {};
  const { data } = await getRole(rowData.roleId as number);
  roleInfo = data;
  await getRoleMenuTreeSelect(rowData.roleId as number);
  await getDeptTree(rowData.roleId as number);
  console.log(deptOptions.value);
  let params = {
    title: "分配数据权限",
    rowData: { ...roleInfo },
    isView: false,
    api: dataScope,
    getTableList: proTable.value.getTableList,
    messHallOptions: messHallList.value,
    carOptions: carOptions.value,
    siteOptions: siteOptions.value,
    companyOptions: companyOptions.value,
    deptOptions: deptOptions.value
  };
  dataDrawerRef.value.acceptParams(params);
};

const authUserDrawerRef = ref();
const handleAuthUser = (row: Role.ResRole) => {
  let params = {
    roleId: row.roleId,
    isView: false,
    getTableList: proTable.value.getTableList,
    roleStatus: roleStatus.value
  };
  authUserDrawerRef.value.acceptParams(params);
};
</script>
