<template>
  <el-dialog v-model="drawerVisible" width="1300" destroy-on-close title="分配用户" top="5vh">
    <div class="main-box">
      <div class="table-box" style="height: 600px">
        <ProTable
          ref="proTable"
          :columns="columns"
          :request-api="getTableList"
          :data-callback="dataCallback"
          :init-param="initParam"
          :page-size="[50, 100, 200, 300]"
          :search-col="4"
          row-key="userId"
        >
          <!-- 表格 header 按钮 -->
          <template #tableHeader="scope">
            <el-button type="primary" v-auth="['system:role:add']" :icon="CirclePlus" @click="openDrawer">添加用户</el-button>
            <el-button
              type="danger"
              v-auth="['system:role:reomve']"
              :icon="Delete"
              plain
              @click="handleBatchDelete(scope.selectedListIds)"
              :disabled="!scope.isSelected"
            >
              批量取消授权
            </el-button>
          </template>
          <!-- 表格操作 -->
          <template #operation="scope">
            <el-button
              type="warning"
              v-auth="['system:role:edit']"
              link
              v-if="scope.row.roleId !== 1"
              :icon="Delete"
              @click="deleteAccount(scope.row)"
              >取消授权</el-button
            >
          </template>
        </ProTable>
      </div>
    </div>
    <template #footer>
      <el-button @click="drawerVisible = false">关闭</el-button>
    </template>
  </el-dialog>
  <AddUserDrawer ref="addUserDrawer" />
</template>

<script setup lang="ts" name="AuthUserDrawer">
import { computed, reactive, ref } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps } from "@/components/ProTable/interface";
import { DictOptions, ResPage } from "@/api/interface";
import { allocatedUserList, authUserCancel, authUserCancelAll } from "@/api/modules/mdc/system/role";
import { CirclePlus, Delete } from "@element-plus/icons-vue";
import { useHandleData } from "@/hooks/useHandleData";
import { User } from "@/api/interface/mealDelivery/system/user";
import AddUserDrawer from "./AddUserDrawer.vue";
interface DrawerProps {
  roleId: number;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  roleStatus?: DictOptions[];
}

const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  roleId: 0
});

const initParam = reactive({ pageSize: 50, roleId: 0 });

const proTable = ref<InstanceType<typeof ProTable>>();

const dataCallback = (data: ResPage<User.ResUser>) => {
  return {
    list: data.rows,
    total: data.total
  };
};
const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  newParams.roleId = drawerProps.value.roleId;
  return allocatedUserList(newParams);
};
const columns = computed((): ColumnProps<User.ResUser>[] => [
  { type: "selection", fixed: "left", width: 50 },
  {
    prop: "userName",
    label: "用户工号",
    search: { el: "input" }
  },
  // 多级 prop
  {
    prop: "nickName",
    label: "用户姓名",
    search: { el: "input" }
  },
  { prop: "email", label: "邮箱", width: 140 },
  { prop: "phonenumber", label: "手机号", width: 120, search: { el: "input" } },
  {
    prop: "status",
    label: "状态",
    enum: drawerProps.value.roleStatus,
    sortable: true,
    tag: true,
    width: 100
  },
  { prop: "createTime", label: "main.createTime", width: 160 },
  { prop: "operation", label: "main.operation", fixed: "right", width: 200 }
]);

// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  initParam.roleId = params.roleId;
};

const handleBatchDelete = async (selectedListIds: number[]) => {
  await useHandleData(
    authUserCancelAll,
    {
      roleId: drawerProps.value.roleId,
      userIds: selectedListIds.join(",")
    },
    "批量取消授权"
  );
  proTable.value?.clearSelection();

  proTable.value?.getTableList();
};
const addUserDrawer = ref();
const openDrawer = () => {
  addUserDrawer.value.acceptParams({
    roleId: drawerProps.value.roleId,
    getTableList: proTable.value?.getTableList,
    roleStatus: drawerProps.value.roleStatus
  });
};

const deleteAccount = async (row: User.ResUser) => {
  await useHandleData(
    authUserCancel,
    {
      roleId: drawerProps.value.roleId,
      userId: row.userId
    },
    `确认要取消该用户${row.userName}角色吗？`
  );
  proTable.value?.getTableList();
};

defineExpose({
  acceptParams
});
</script>
