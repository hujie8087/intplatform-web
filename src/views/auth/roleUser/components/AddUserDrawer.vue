<template>
  <el-dialog
    v-model="drawerVisible"
    :destroy-on-close="true"
    :title="`${drawerProps.title}-${drawerProps.rowData.roleName}-用户`"
    width="1200px"
    :draggable="true"
  >
    <ProTable
      ref="proUserTable"
      :columns="columns"
      :request-api="getTableList"
      :data-callback="dataCallback"
      row-key="userId"
      :tool-button="false"
      :search-col="4"
      :init-param="initParam"
    >
    </ProTable>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" @click="handleSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="ApplyDrawer">
import { computed, ref } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import { Account } from "@/api/interface/system";
import { getUnallocatedUserList } from "@/api/modules/login";
import { DictOptions } from "@/api/interface";
const { t } = useI18n(); // 解构出t方法

const initParam = ref<any>({});

const proUserTable = ref<ProTableInstance>();
const dataCallback = (data: any) => {
  return {
    list: data.data.list,
    total: data.data.total
  };
};

const userStatus = ref<DictOptions[]>([
  { label: "未知", value: 0, tagType: "danger" },
  { label: "未激活", value: 1, tagType: "success" },
  { label: "正常", value: 2, tagType: "primary" },
  { label: "禁用", value: 3, tagType: "danger" },
  { label: "锁定", value: 4, tagType: "warning" },
  { label: "离职", value: 5, tagType: "info" },
  { label: "退休", value: 6, tagType: "info" },
  { label: "黑名单", value: 7, tagType: "danger" }
]);

const columns = computed((): ColumnProps<Account.ResThirdUser>[] => [
  { type: "selection", fixed: "left", width: 50 },
  {
    prop: "account",
    label: "用户帐号",
    width: 120,
    search: { el: "input" }
  },
  {
    prop: "name",
    label: "用户姓名",
    width: 160,
    search: { el: "input" }
  },
  {
    prop: "sex",
    label: "性别",
    width: 100
  },
  {
    prop: "tel",
    label: "电话",
    width: 120
  },
  {
    prop: "postName",
    label: "岗位",
    width: 160
  },
  {
    prop: "formatOrganizeName",
    label: "所属组织"
  },
  {
    prop: "status",
    label: "状态",
    enum: userStatus,
    width: 100,
    tag: true,
    search: { el: "select", props: { filterable: true } }
  }
]);
const getTableList = (params: any) => {
  const newParams = JSON.parse(JSON.stringify(params));
  newParams.size = params.pageSize;
  newParams.current = params.pageNum;
  delete newParams.pageSize;
  delete newParams.pageNum;
  return getUnallocatedUserList(newParams);
};
interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<Account.ResRoleUserList>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  isView: false,
  rowData: {}
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  console.log(drawerProps.value.rowData);
  drawerVisible.value = true;
};

// 提交数据（新增/编辑）
const handleSubmit = async () => {
  if (proUserTable.value?.selectedList.length === 0) {
    ElMessage.warning("请选择用户");
    return;
  }
  const formData = {
    roleId: drawerProps.value.rowData.roleId,
    userInfo: proUserTable.value?.selectedList?.map(item => {
      return {
        userId: item.id,
        userName: item.account
      };
    })
  };
  try {
    await drawerProps.value.api!(formData);
    ElMessage.success({
      message: t("main.successMsg", { title: "绑定用户成功", method: `${drawerProps.value.title}` })
    });
    drawerProps.value.getTableList?.();
    drawerVisible.value = false;
  } catch (error) {
    console.log(error);
  }
};

defineExpose({
  acceptParams
});
</script>
