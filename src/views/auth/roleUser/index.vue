<template>
  <div class="main-box">
    <div class="table-box">
      <div class="card table-search">
        <div>
          <div class="el-form-item el-form-item--small" style="width: 200px">
            <label class="el-form-item__label">搜索：</label>
            <div class="el-form-item__content">
              <div class="el-input el-input--small el-input--suffix">
                <div class="el-input__wrapper">
                  <input
                    type="text"
                    class="el-input__inner"
                    v-model="keyword"
                    placeholder="请输入搜索内容"
                    @keydown.enter="filter"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <vue3-tree-org
        ref="treeOrgRef"
        v-if="roleListData?.children?.length"
        :data="roleListData"
        :props="{ label: 'roleName', children: 'children', id: 'roleId', pid: 'prId', num: 'num', level: 'level' }"
        :horizontal="false"
        :center="true"
        :collapsable="true"
        :label-style="style"
        :node-draggable="false"
        :only-one-node="onlyOneNode"
        :default-expand-level="1"
        :clone-node-drag="cloneNodeDrag"
        :disabled="true"
        :filter-node-method="filterNodeMethod"
        @on-node-click="onNodeClick"
      >
        <!-- 自定义节点内容 -->
        <template #default="{ node }">
          <div class="tree-org-node__text node-label">{{ node.label }}({{ node.$$data.num }})</div>
        </template>
        <!-- 自定义展开按钮 -->
        <template #expand="{ node }">
          <div>{{ node.children.length }}</div>
        </template>
      </vue3-tree-org>
    </div>
    <AddUserDrawer ref="addUserDrawer" />
    <el-dialog v-model="dialogVisible" title="人员列表" width="1200px">
      <div style="height: 600px">
        <ProTable
          ref="proTable"
          :columns="columns"
          :request-api="getRoleUserList"
          :data-callback="dataCallback"
          row-key="userId"
          :tool-button="false"
          :init-param="initParam"
        >
          <template #tableHeader="scope">
            <!-- 新增 -->
            <el-button type="primary" icon="Plus" @click="handleAddAuth">新增授权</el-button>
            <el-button
              type="danger"
              icon="Delete"
              :disabled="!scope.isSelected"
              @click="handleCancelAuthAll(scope.selectedListIds)"
              >批量取消授权</el-button
            >
          </template>
          <template #operation="scope">
            <el-button type="warning" @click="handleCancelAuth(scope.row)">取消授权</el-button>
          </template>
        </ProTable>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="tsx" name="authRoleUser">
import { addAuth, cancelAuth, cancelAuthAll, getRoleUserList, getRoleUserNumber } from "@/api/modules/system/role";
import { computed, ref } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance } from "@/components/ProTable/interface";
import { ColumnProps } from "@/components/ProTable/interface";
import { Account, Role } from "@/api/interface/system";
import { User } from "@/api/interface";
import { ElMessage } from "element-plus";
import AddUserDrawer from "./components/AddUserDrawer.vue";
const dialogVisible = ref(false);
const proTable = ref<ProTableInstance>();
const initParam = ref<Account.ReqRoleUserParams>({ roleId: 0, pageSize: 10, pageNum: 1 });
const roleListData = ref<Role.ResRoleUser>();
const dataCallback = (data: any) => {
  console.log(data);
  return {
    list: data.rows,
    total: data.total,
    current: data.current,
    size: data.size
  };
};
const style = ref({});
const onlyOneNode = ref(false);
const cloneNodeDrag = ref(false);
const keyword = ref("");
const columns = computed((): ColumnProps<User.ResUserList>[] => [
  { type: "selection", fixed: "left", width: 50 },
  {
    prop: "roleName",
    label: "角色名称"
  },
  {
    prop: "userName",
    label: "用户帐号"
  },
  {
    prop: "nickName",
    label: "用户姓名"
  },
  {
    prop: "userId",
    label: "用户编号"
  },
  {
    prop: "operation",
    label: "操作",
    width: 120,
    fixed: "right"
  }
]);

const getRoleTreeList = async () => {
  const { data } = await getRoleUserNumber();
  roleListData.value = {
    roleId: 0,
    prId: 0,
    roleName: "IWIP后勤综合服务平台",
    level: 0,
    num: 0,
    children: data || []
  };

  console.log(roleListData.value);
};

getRoleTreeList();
const treeOrgRef = ref();
const filter = () => {
  treeOrgRef.value?.filter(keyword.value);
};
const filterNodeMethod = (value, data) => {
  console.log(value, data);
  if (!value) return true;
  return data.label.indexOf(value) !== -1;
};
const onNodeClick = async (e, data) => {
  dialogVisible.value = true;
  initParam.value.roleId = data.roleId;
  setTimeout(() => {
    proTable.value?.getTableList();
  }, 100);
};

const handleCancelAuth = async (row: Account.ResRoleUserList) => {
  const result = await cancelAuth({ roleId: row.roleId, userName: row.userName });
  if (result.code === 200) {
    ElMessage.success("取消授权成功");
    initParam.value.roleId = row.roleId;
    proTable.value?.getTableList();
  } else {
    ElMessage.error("取消授权失败");
  }
};

const handleCancelAuthAll = async (selectedListIds: number[]) => {
  const result = await cancelAuthAll({ userNames: selectedListIds.join(",") });
  if (result.code === 200) {
    ElMessage.success("批量取消授权成功");
    proTable.value?.getTableList();
  } else {
    ElMessage.error("批量取消授权失败");
  }
};

const addUserDrawer = ref<InstanceType<typeof AddUserDrawer> | null>(null);
const handleAddAuth = async () => {
  const params = {
    title: "新增授权",
    isView: false,
    api: addAuth,
    rowData: {},
    getTableList: proTable.value?.getTableList
  };
  addUserDrawer.value?.acceptParams(params);
};
</script>

<style scoped lang="scss">
:deep(.tree-org-node) {
  .node-label {
    display: block;
    cursor: pointer;
    border-radius: 4px;
    box-shadow: 0 0 0 1px #dcdfe6;
    transition: all 0.3s;
    &:hover {
      background-color: #f0f2f5;
      border-radius: 4px;
      box-shadow: 0 0 0 1px #dcdfe6;
      .tree-org-node__text {
        color: #303133;
      }
    }
  }
}
</style>
