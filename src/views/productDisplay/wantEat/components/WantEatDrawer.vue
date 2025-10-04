<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="1000" :title="`${drawerProps.title}留言`">
    <el-form
      ref="ruleFormRef"
      label-width="120px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="drawerProps.rowData"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-row>
        <el-col :span="24">
          <el-form-item label="菜名" prop="def1">
            <el-input
              v-model="drawerProps.rowData.def1"
              :disabled="drawerProps.isReply"
              :placeholder="`${$t('main.inputError', '菜名')}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="做法" prop="content">
            <el-input
              type="textarea"
              :rows="4"
              v-model="drawerProps.rowData.content"
              :disabled="drawerProps.isReply"
              :placeholder="`${$t('main.inputError', '做法')}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="联系人" prop="contacts">
            <el-input
              v-model="drawerProps.rowData.contacts"
              :disabled="drawerProps.isReply"
              :placeholder="`${$t('main.inputError', '联系人')}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="工号" prop="def2">
            <el-input
              v-model="drawerProps.rowData.def2"
              :disabled="drawerProps.isReply"
              :placeholder="`${$t('main.inputError', '工号')}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="联系电话" prop="phone">
            <el-input
              v-model="drawerProps.rowData.phone"
              :disabled="drawerProps.isReply"
              :placeholder="`${$t('main.inputError', '联系电话')}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="回复内容" prop="processingResults">
            <el-input type="textarea" :rows="4" v-model="drawerProps.rowData.processingResults" />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="drawerProps.isView">
          <el-form-item label="回复状态" prop="processingStatus">
            <el-tag :type="drawerProps.rowData.processingStatus === 0 ? 'warning' : 'success'">
              {{ drawerProps.rowData.processingStatus === 0 ? "待回复" : "已回复" }}
            </el-tag>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="drawerProps.isView">
          <el-form-item label="回复时间" prop="handleTime">
            <el-date-picker v-model="drawerProps.rowData.handleTime" type="datetime" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" v-show="!drawerProps.isView" @click="handleSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="WantEatDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { Complaint } from "@/api/interface/service/complaint";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
const { t } = useI18n(); // 解构出t方法
import { useUserStore } from "@/stores/modules/user";
import dayjs from "dayjs";

const userStore = useUserStore();

const rules = reactive({
  processingResults: [{ required: true, message: t("main.inputError", { msg: "回复内容" }) }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  isReply: boolean;
  rowData: Partial<Complaint.ResComplaintMessage>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  noticeTypeOptions?: DictOptions[];
  noticeStatusOptions?: DictOptions[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  isReply: false,
  title: "",
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
    try {
      await drawerProps.value.api!({
        ...drawerProps.value.rowData,
        processingStatus: 1,
        handleBy: userStore.userInfo?.user.nickName,
        handleTime: dayjs().format("YYYY-MM-DD HH:mm:ss")
      });
      ElMessage.success({
        message: t("main.successMsg", { title: "配送费", method: `${drawerProps.value.title}` })
      });
      drawerProps.value.getTableList!();
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
