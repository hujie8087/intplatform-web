<template>
  <div class="main-box">
    <div class="main-content-split">
      <div class="tree-panel" :style="{ width: leftWidth + 'px' }">
        <TreeFilter
          ref="treeFilterRef"
          title="部门列表"
          label="label"
          id="id"
          :request-api="deptTreeSelect"
          :default-value="treeFilterValues.deptId"
          @change="changeTreeFilter"
          :default-expanded-keys="defaultExpandedKeys"
        />
      </div>
      <div class="splitter" @mousedown="onSplitterMouseDown"></div>
      <div class="table-box">
        <ProTable
          ref="proTable"
          highlight-current-row
          :columns="columns"
          :request-api="getUserList"
          :init-param="treeFilterValues"
          :data-callback="dataCallback"
          :page-size="[50, 150, 200, 300]"
          :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        >
          <!-- 表格 header 按钮 -->
          <template #tableHeader>
            <el-button type="primary" v-mealAuth="['system:user:add']" :icon="CirclePlus" @click="openDrawer('新增')">
              新增
            </el-button>
            <el-button
              type="danger"
              v-auth="['system:user:remove']"
              :disabled="!proTable?.isSelected"
              :icon="Delete"
              @click="deleteAccount(null)"
              >删除</el-button
            >
            <el-button type="primary" v-mealAuth="['system:user:import']" :icon="Upload" plain @click="batchAdd">
              批量添加
            </el-button>
            <el-button type="warning" v-mealAuth="['system:user:export']" :icon="Download" plain @click="downloadFile">
              导出用户数据
            </el-button>
          </template>
          <!-- 表格操作 -->
          <template #operation="scope">
            <el-button
              type="warning"
              link
              v-if="scope.row.userId !== 1"
              :icon="EditPen"
              v-mealAuth="['system:user:edit']"
              @click="openDrawer('编辑', scope.row)"
            >
              编辑
            </el-button>
            <el-button type="danger" link :icon="Delete" v-mealAuth="['system:user:remove']" @click="deleteAccount(scope.row)"
              >删除</el-button
            >
            <el-dropdown v-if="scope.row.userId !== 1" style="display: inline-block; margin-left: 10px; vertical-align: middle">
              <el-button type="success" link :icon="DArrowRight">更多</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>
                    <el-button
                      type="primary"
                      link
                      :icon="Refresh"
                      v-mealAuth="['system:user:resetPwd']"
                      @click="resetPass(scope.row)"
                      >重置密码</el-button
                    >
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <el-button
                      type="primary"
                      link
                      :icon="CircleCheck"
                      v-mealAuth="['system:user:edit']"
                      @click="openRoleDrawer(scope.row)"
                      >分配角色</el-button
                    >
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </ProTable>
        <!-- 新增/修改用户弹窗 -->
        <UserDrawer ref="drawerRef" />
        <RoleDrawer ref="roleDrawerRef" />
        <ImportExcel ref="dialogRef" />
      </div>
    </div>
  </div>
</template>

<script setup lang="tsx" name="useSelectFilter">
import { ref, reactive, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useHandleData } from "@/hooks/useHandleData";
import { useDownload } from "@/hooks/useDownload";
import ProTable from "@/components/ProTable/index.vue";
import TreeFilter from "@/components/TreeFilter/index.vue";
import ImportExcel from "./components/ImoportExcel.vue";
import UserDrawer from "./components/UserMessage.vue";
import RoleDrawer from "./components/RoleDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, Download, Upload, Refresh, CircleCheck, DArrowRight } from "@element-plus/icons-vue";
import {
  delUser,
  listUser,
  updateUser,
  addUser,
  changeUserStatus,
  resetUserPwd,
  deptTreeSelect,
  updateAuthRole,
  getAuthRole,
  getAllAuthRole,
  batchAddUser
} from "@/api/modules/mdc/system/user";
import { User } from "@/api/interface/mealDelivery/system/user";
import { useAuthButtons } from "@/hooks/useAuthButtons";
const { BUTTONS } = useAuthButtons();
import { useDict } from "@/hooks/useDict";
import { DictOptions } from "@/api/interface";
import { Role } from "@/api/interface/mealDelivery/system/role";
import { getConfigData } from "@/api/modules/system/config";

const baseUrl = import.meta.env.VITE_API_URL;
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

// 获取国籍数据字典
const nationOptions = ref<DictOptions[]>([]);
const accountTypeOptions = ref<DictOptions[]>([]);
const userSexOptions = ref<DictOptions[]>([]);
const userStatusOptions = ref<DictOptions[]>([]);
useDict("sys_nationality", "sys_account_type", "sys_user_sex", "sys_normal_disable").then(res => {
  nationOptions.value = res.sys_nationality;
  accountTypeOptions.value = res.sys_account_type;
  userSexOptions.value = res.sys_user_sex;
  userStatusOptions.value = res.sys_normal_disable;
});
const initPassword = ref("");
const getDictData = async () => {
  const res = await getConfigData("sys.mealuser.initPassword");
  initPassword.value = res.msg;
};
getDictData();
// 部门树形选择实例
const treeFilterRef = ref<InstanceType<typeof TreeFilter>>();

const getUserList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  if (newParams.deptId === 0) {
    delete newParams.deptId;
  }
  if (Array.isArray(newParams.createTime) && newParams.createTime.length === 2) {
    newParams.params = {
      beginTime: newParams.createTime[0],
      endTime: newParams.createTime[1]
    };
    delete newParams.createTime;
  }
  return listUser(newParams);
};
// 表格配置项
const columns = reactive<ColumnProps<User.ResUser>[]>([
  { type: "selection", label: "", width: 50 },
  { prop: "userName", label: "工号", search: { el: "input" }, width: 100 },
  { prop: "nickName", label: "姓名", search: { el: "input" }, width: 140 },
  { prop: "deptPath", label: "部门", width: 140 },
  { prop: "phonenumber", label: "手机号", width: 120 },
  {
    prop: "postNames",
    label: "岗位",
    width: 120,
    render(scope) {
      return (
        <span style={{ color: scope.row.postClerkSortNum ? "red" : "" }}>
          {scope.row.postNames ? scope.row.postNames[0] : ""}
        </span>
      );
    }
  },
  { prop: "accountType", label: "帐号类型", width: 120, enum: accountTypeOptions },
  { prop: "nationality", label: "国籍", width: 80, tag: true, enum: nationOptions },
  {
    prop: "status",
    label: "用户状态",
    tag: true,
    enum: userStatusOptions,
    width: 80,
    search: { el: "select" },
    render: scope => {
      return (
        <span>
          {BUTTONS.value["system:user:edit"] || BUTTONS.value["*:*:*"] ? (
            <el-switch
              model-value={scope.row.status}
              active-value={"0"}
              inactive-value={"1"}
              onClick={() => changeStatus(scope.row)}
            />
          ) : (
            <el-tag type={scope.row.status === "0" ? "success" : "danger"}>{scope.row.status === "0" ? "启用" : "禁用"}</el-tag>
          )}
        </span>
      );
    }
  },
  { prop: "creator", label: "创建人", width: 80 },
  { prop: "createTime", label: "创建时间", width: 140 },
  { prop: "operation", label: "操作", width: 210, fixed: "right" }
]);

// 默认 treeFilter 参数
const treeFilterValues = reactive({ deptId: 0, pageSize: 50 });
const changeTreeFilter = (row: any) => {
  proTable.value!.pageable.pageNum = 1;
  treeFilterValues.deptId = row.id;
};
// 切换用户状态
const changeStatus = async (row: User.ResUser) => {
  await useHandleData(
    changeUserStatus,
    { userId: row.userId, status: row.status == "1" ? "0" : "1" },
    `切换【${row.userName}】用户状态`
  );
  proTable.value?.getTableList();
};
// 删除用户信息
const deleteAccount = async (params: User.ResUser | null) => {
  if (proTable.value?.isSelected) {
    await useHandleData(delUser, proTable.value?.selectedListIds.join(","), `删除用户`);
    proTable.value?.getTableList();
  } else {
    if (params) {
      await useHandleData(delUser, params.userId, `删除【${params.userName}】用户`);
      proTable.value?.getTableList();
    }
  }
};
// 重置用户密码
const resetPass = async (params: User.ResUser) => {
  // await useHandleData(updateUserPwd, { userId: params.userId, password: "123456" }, `重置【${params.userName}】用户密码`);
  // proTable.value?.getTableList();
  ElMessageBox.prompt(`请输入${params.userName}新密码`, "温馨提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputPattern: /^.{5,20}$/,
    inputErrorMessage: "用户密码长度必须介于 5 和 20 之间"
  }).then(({ value }) => {
    resetUserPwd(params.userId, value)
      .then(() => {
        ElMessage({
          type: "success",
          message: `重置密码成功`
        });
        proTable.value?.getTableList();
      })
      .catch(() => {
        ElMessage({
          type: "error",
          message: "重置密码失败"
        });
      });
  });
};

// 导出用户列表
const downloadFile = async () => {
  ElMessageBox.confirm("确认导出用户数据?", "温馨提示", { type: "warning" }).then(() =>
    useDownload(`${baseUrl}/system/user/export`, "用户列表", true, ".xlsx", "post", proTable.value?.searchParam)
  );
};

// 批量添加用户
const dialogRef = ref<InstanceType<typeof ImportExcel> | null>(null);
const batchAdd = () => {
  const params = {
    title: "用户",
    tempApi: "/system/mdc/user/importTemplate",
    importApi: batchAddUser,
    getTableList: proTable.value?.getTableList
  };
  dialogRef.value?.acceptParams(params);
};
const transformDeptList = list => {
  return list.map(item => ({
    ...item,
    shortLabel: item.label, // 下拉展示用
    label: item.deptPath || item.label, // 输入框展示用
    children: item.children ? transformDeptList(item.children) : []
  }));
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof UserDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<User.ResUser> = {}) => {
  let rowData = { ...row };
  let roleOptions = [];
  let postOptions = [];
  if (rowData.userId) {
    const res: any = await getAllAuthRole(rowData.userId);
    roleOptions = res.roles;
    postOptions = res.posts;
    rowData = res.data;
    Object.assign(rowData, { postIds: res.postIds[0], roleIds: res.roleIds });
  } else {
    const res: any = await getAllAuthRole("");
    roleOptions = res.roles; // 角色
    postOptions = res.posts; // 岗位
    // 如果左边部门树选择值了带过去
    if (treeFilterValues.deptId) {
      rowData.deptId = treeFilterValues.deptId;
    }
    rowData.status = "0";
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...rowData, password: initPassword.value },
    api: title === "新增" ? addUser : title === "编辑" ? updateUser : undefined,
    getTableList: proTable.value?.getTableList,
    deptList: transformDeptList(JSON.parse(JSON.stringify(treeFilterRef.value?.treeData))),
    accountTypeOptions: accountTypeOptions.value,
    roleOptions,
    postOptions,
    nationOptions
  };
  drawerRef.value?.acceptParams(params);
};
const defaultExpandedKeys = computed(() => {
  const keys = [];
  treeFilterRef.value?.treeData.forEach(rootNode => {
    keys.push(rootNode.id); // 展开第一层节点
  });
  return keys;
});
const leftWidth = ref(260); // 初始宽度
let dragging = false;

const onSplitterMouseDown = (e: MouseEvent) => {
  dragging = true;
  document.body.style.cursor = "col-resize";
  const startX = e.clientX;
  const startWidth = leftWidth.value;

  const onMouseMove = (moveEvent: MouseEvent) => {
    if (!dragging) return;
    const delta = moveEvent.clientX - startX;
    let newWidth = startWidth + delta;
    // 限制最小/最大宽度
    newWidth = Math.max(180, Math.min(newWidth, 600));
    leftWidth.value = newWidth;
  };

  const onMouseUp = () => {
    dragging = false;
    document.body.style.cursor = "";
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
};

// 打开角色分配 drawer
const roleDrawerRef = ref<InstanceType<typeof RoleDrawer> | null>(null);
const openRoleDrawer = async (row: User.ResUser) => {
  let roleList: Role.ResRole[] = [];
  let user = ref<User.ResUser>();
  if (row.userId) {
    const res = await getAuthRole(row.userId);
    roleList = res.roles;
    user.value = res.user;
  }

  const params = {
    title: "角色分配",
    isView: false,
    rowData: user.value,
    api: updateAuthRole,
    getTableList: proTable.value?.getTableList,
    roleList: roleList
  };
  roleDrawerRef.value?.acceptParams(params);
};
</script>

<style scoped>
.main-content-split {
  display: flex;
  min-width: 0;
  height: 100%;
}
.tree-panel {
  min-width: 180px;
  max-width: 600px;
  overflow: auto;
  background: #ffffff;
  border-right: 1px solid #eeeeee;
  transition: width 0.1s;
}
.splitter {
  z-index: 2;
  width: 6px;
  cursor: col-resize;
  background: #f5f5f5;
  transition: background 0.2s;
}
.splitter:hover {
  background: #b3d8fd;
}
.table-box {
  flex: 1;
  min-width: 0;
  margin-left: 0;
  overflow: auto;
  background: #ffffff;
}
</style>
