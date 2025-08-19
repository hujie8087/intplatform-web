<template>
  <el-dialog v-model="drawerVisible" width="1300" destroy-on-close title="添加用户" top="5vh">
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
          :tool-button="false"
          row-key="userId"
        >
        </ProTable>
      </div>
    </div>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" @click="handleSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="AddUserDrawer">
import { computed, reactive, ref } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps } from "@/components/ProTable/interface";
import { DictOptions, ResPage } from "@/api/interface";
import { authUserSelectAll, unallocatedUserList } from "@/api/modules/mdc/system/role";
import { User } from "@/api/interface/mealDelivery/system/user";
import { ElMessage } from "element-plus";
interface DrawerProps {
  roleId: number;
  getTableList?: () => Promise<any>;
  roleStatus?: DictOptions[];
}

const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  roleId: 0
});

const initParam = reactive({ pageSize: 50, roleId: 0 });

const proTable = ref();

const dataCallback = (data: ResPage<User.ResUser>) => {
  return {
    list: data.rows,
    total: data.total
  };
};
const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  newParams.roleId = drawerProps.value.roleId;
  return unallocatedUserList(newParams);
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
  { prop: "createTime", label: "main.createTime", width: 160 }
]);

// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  initParam.roleId = params.roleId;
};

// 提交数据（新增/编辑）
const handleSubmit = async () => {
  if (proTable.value.selectedListIds.length === 0) {
    ElMessage.warning("请选择用户");
    return;
  } else {
    await authUserSelectAll({
      roleId: drawerProps.value.roleId,
      userIds: proTable.value.selectedListIds.join(",")
    });
    drawerVisible.value = false;
    drawerProps.value.getTableList?.();
  }
};

defineExpose({
  acceptParams
});
</script>
