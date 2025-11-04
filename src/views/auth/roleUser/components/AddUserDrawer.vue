<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}用户`" width="1000px">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getTableList"
      :data-callback="dataCallback"
      row-key="userId"
      :tool-button="false"
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
import { ElMessage, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import { Account } from "@/api/interface/system";
import { getUnallocatedUserList } from "@/api/modules/login";
const { t } = useI18n(); // 解构出t方法

const initParam = ref<any>({});

const proTable = ref<ProTableInstance>();
const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total
  };
};
const columns = computed((): ColumnProps<Account.ResAccountList>[] => [
  { type: "selection", fixed: "left", width: 50 },
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
  drawerVisible.value = true;
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    const formData = {
      ...drawerProps.value.rowData
    };
    try {
      await drawerProps.value.api!(formData);
      ElMessage.success({
        message: t("main.successMsg", { title: "住宿申请流程", method: `${drawerProps.value.title}` })
      });
      proTable.value?.getTableList();
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

defineExpose({
  acceptParams
});
</script>
