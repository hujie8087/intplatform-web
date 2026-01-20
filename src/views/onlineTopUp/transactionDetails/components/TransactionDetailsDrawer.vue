<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="500" :title="`${drawerProps.title}流水明细`">
    <el-form
      ref="ruleFormRef"
      label-width="120px"
      label-suffix=" :"
      :disabled="drawerProps.isView"
      :model="drawerProps.rowData"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-row>
        <el-col :span="24">
          <el-form-item label="月份" prop="yearMonth">
            <el-input
              v-model="drawerProps.rowData.yearMonth"
              :placeholder="`${$t('main.inputError', '月份')}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <!-- 工号 -->
          <el-form-item label="工号" prop="account">
            <el-input v-model="drawerProps.rowData.account" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <!-- 姓名 -->
          <el-form-item label="姓名" prop="name">
            <el-input v-model="drawerProps.rowData.name" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <!-- 充值金额 -->
          <el-form-item label="充值金额" prop="amount">
            <el-input v-model="drawerProps.rowData.amount" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <!-- 充值时间-->
          <el-form-item label="充值时间" prop="createTime">
            <el-input v-model="drawerProps.rowData.createTime" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="TransactionDetailsDrawer">
import { ref } from "vue";
import { TransactionDetails } from "@/api/interface/onlineTopUp";

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<TransactionDetails.ResTransactionDetails>;
  getTableList?: () => Promise<any>;
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  rowData: {}
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

defineExpose({
  acceptParams
});
</script>
