<template>
  <div class="main-box">
    <TreeFilter
      ref="treeFilterRef"
      title="部门列表"
      label="label"
      :request-api="getUserDepartment"
      :default-value="treeFilterValues.deptId"
      @change="changeTreeFilter"
    />
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getUserList"
        :init-param="treeFilterValues"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader>
          <el-button type="primary" v-auth="['system:user:add']" :icon="CirclePlus" @click="openDrawer('新增')">
            新增用户
          </el-button>
          <el-button type="primary" v-auth="['system:user:import']" :icon="Upload" plain @click="batchAdd">
            批量添加用户
          </el-button>
          <el-button type="warning" v-auth="['system:user:export']" :icon="Download" plain @click="downloadFile">
            导出用户数据
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button
            type="primary"
            link
            v-if="scope.row.userId !== 1"
            :icon="EditPen"
            v-auth="['system:user:edit']"
            @click="openDrawer('编辑', scope.row)"
          >
            编辑
          </el-button>
          <el-dropdown v-if="scope.row.userId !== 1" style="display: inline-block; margin-left: 10px; vertical-align: middle">
            <el-button type="primary" link :icon="DArrowRight">更多</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-button type="primary" link :icon="Refresh" v-auth="['system:user:resetPwd']" @click="resetPass(scope.row)"
                    >重置密码</el-button
                  >
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button
                    type="primary"
                    link
                    :icon="CircleCheck"
                    v-auth="['system:user:edit']"
                    @click="handleAuthRole(scope.row)"
                    >分配角色</el-button
                  >
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button type="primary" link :icon="Delete" v-auth="['system:user:remove']" @click="deleteAccount(scope.row)"
                    >删除</el-button
                  >
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </ProTable>
      <UserDrawer ref="drawerRef" />
      <RoleDrawer ref="roleDrawerRef" />
      <ImportExcel ref="dialogRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="useSelectFilter">
import { ref, reactive, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useHandleData } from "@/hooks/useHandleData";
import { useDownload } from "@/hooks/useDownload";
import ProTable from "@/components/ProTable/index.vue";
import TreeFilter from "@/components/TreeFilter/index.vue";
import ImportExcel from "@/components/ImportExcel/index.vue";
import UserDrawer from "./components/UserDrawer.vue";
import RoleDrawer from "./components/RoleDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, Download, Upload, View, Refresh, CircleCheck, DArrowRight } from "@element-plus/icons-vue";
import {
  getUserList,
  deleteUser,
  editUser,
  addUser,
  resetUserPassWord,
  BatchAddUser,
  getUserDepartment
} from "@/api/modules/user";
import { Account, Role } from "@/api/interface/system";
import { getUserRole, updateRole, changeUserStatus } from "@/api/modules/system/user";
import { genderType, userStatus, userType } from "@/utils/serviceDict";
import { useAuthButtons } from "@/hooks/useAuthButtons";
import { getRoleList } from "@/api/modules/system/role";
const { BUTTONS } = useAuthButtons();

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
// 部门树形选择实例
const treeFilterRef = ref<InstanceType<typeof TreeFilter>>();
// 表格配置项
const columns = reactive<ColumnProps<Account.ResAccountList>[]>([
  { type: "selection", label: "", width: 80 },
  { type: "index", label: "用户编号", width: 80 },
  { prop: "userName", label: "用户帐号", search: { el: "input" }, width: 120 },
  { prop: "nickName", label: "用户姓名", search: { el: "input" }, width: 120 },
  { prop: "dept.deptName", label: "部门", width: 120 },
  { prop: "phonenumber", label: "手机号" },
  { prop: "sex", label: "性别", enum: genderType },
  { prop: "email", label: "邮箱", width: 120 },
  {
    prop: "status",
    label: "用户状态",
    tag: true,
    enum: userStatus,
    width: 100,
    search: { el: "select" },
    render: scope => {
      return (
        <>
          {BUTTONS.value["system:user:edit"] ? (
            <el-switch
              model-value={scope.row.status}
              active-text={scope.row.status ? "启用" : "禁用"}
              active-value={"0"}
              inactive-value={"1"}
              onClick={() => changeStatus(scope.row)}
            />
          ) : (
            <el-tag type={scope.row.status === "0" ? "success" : "danger"}>{scope.row.status ? "启用" : "禁用"}</el-tag>
          )}
        </>
      );
    }
  },
  {
    prop: "userType",
    label: "用户类型",
    width: 120,
    tag: true,
    enum: userType,
    search: { el: "select" }
  },
  { prop: "createTime", label: "创建时间", width: 180, sortable: true },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

const roleList = ref<Role.ResRole[]>([]);
const getRolesList = async () => {
  const res = await getRoleList({ pageNum: 1, pageSize: 1000 });
  roleList.value = res.rows;
};
getRolesList();
// 默认 treeFilter 参数
const treeFilterValues = reactive({ deptId: 0 });
const changeTreeFilter = (val: number) => {
  proTable.value!.pageable.pageNum = 1;
  treeFilterValues.deptId = val;
};

watch(
  () => proTable.value?.radio,
  () => proTable.value?.radio && ElMessage.success(`选中 id 为【${proTable.value?.radio}】的数据`)
);
// 切换用户状态
const changeStatus = async (row: Account.ResAccountList) => {
  await useHandleData(
    changeUserStatus,
    { userId: row.userId, status: row.status == "1" ? "0" : "1" },
    `切换【${row.userName}】用户状态`
  );
  proTable.value?.getTableList();
};
// 删除用户信息
const deleteAccount = async (params: Account.ResAccountList) => {
  await useHandleData(deleteUser, { id: [params.userId] }, `删除【${params.userName}】用户`);
  proTable.value?.getTableList();
};

// 重置用户密码
const resetPass = async (params: Account.ResAccountList) => {
  await useHandleData(resetUserPassWord, { userId: params.userId, password: "123456" }, `重置【${params.userName}】用户密码`);
  proTable.value?.getTableList();
};

// 导出用户列表
const downloadFile = async () => {
  ElMessageBox.confirm("确认导出用户数据?", "温馨提示", { type: "warning" }).then(() =>
    useDownload("intplatform-stage-api/system/user/export", "用户列表", true, ".xlsx", "post", proTable.value?.searchParam)
  );
};

// 批量添加用户
const dialogRef = ref<InstanceType<typeof ImportExcel> | null>(null);
const batchAdd = () => {
  const params = {
    title: "用户",
    tempApi: "intplatform-stage-api/system/user/importTemplate",
    importApi: BatchAddUser,
    getTableList: proTable.value?.getTableList
  };
  dialogRef.value?.acceptParams(params);
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof UserDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Account.ResAccountList> = {}) => {
  let rowData = { ...row };
  if (rowData.userId) {
    const res = await getUserRole(rowData.userId);
    rowData = res.user;
    rowData.roleIds = rowData.roles ? rowData.roles.map(item => item.roleId) : [];
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...rowData },
    api: title === "新增" ? addUser : title === "编辑" ? editUser : undefined,
    getTableList: proTable.value?.getTableList,
    deptList: treeFilterRef.value?.treeData,
    roleList: roleList.value
  };
  drawerRef.value?.acceptParams(params);
};

// 分配角色
const roleDrawerRef = ref<InstanceType<typeof RoleDrawer> | null>(null);
const handleAuthRole = async (params: Account.ResAccountList) => {
  const res = await getUserRole(params.userId);
  roleDrawerRef.value?.acceptParams({
    title: "分配角色",
    isView: false,
    api: updateRole,
    rowData: res.user,
    roleList: res.roles
  });
};
</script>
