<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}报修单`">
    <el-form ref="ruleFormRef" label-width="120px" label-suffix=" :" :rules="rules" :model="drawerProps.rowData">
      <el-row>
        <el-col :span="24">
          <el-form-item label="报修区域" prop="repairArea">
            <!-- 选择报修区域 -->
            <el-input v-model="drawerProps.rowData.repairArea" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="报修房间" prop="roomNo">
            <!-- 选择报修房间 -->
            <el-input v-model="drawerProps.rowData.roomNo" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="报修人" prop="repairPerson">
            <!-- 选择报修人 -->
            <el-input v-model="drawerProps.rowData.repairPerson" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="报修说明" prop="repairMessage">
            <el-input v-model="drawerProps.rowData!.repairMessage" type="textarea" clearable disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-show="drawerProps.rowData!.ratingMessage">
          <el-form-item label="维修反馈信息" prop="ratingMessage">
            <el-input v-model="drawerProps.rowData!.ratingMessage" type="textarea" clearable disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="维修类型" prop="repairType">
            <!-- 选择维修类型 -->
            <el-select v-model="drawerProps.rowData.repairType" placeholder="请选择维修类型" clearable>
              <el-option
                v-for="item in drawerProps.repairTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="维修时间" prop="repairTime">
            <el-date-picker v-model="drawerProps.rowData.repairTime" type="datetime" placeholder="请选择维修时间" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="维修说明" prop="repairNote">
            <el-input
              v-model="drawerProps.rowData!.repairNote"
              type="textarea"
              :placeholder="`${$t('main.inputError', { msg: '请填写维修类型' })}`"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('system.notice.status')}`" prop="status">
            <el-radio-group
              v-model="drawerProps.rowData!.repairState"
              :placeholder="`${$t('main.selectError', { msg: '维修状态' })}`"
            >
              <el-radio v-for="item in drawerProps.repairStatusOptions" :key="item.value" :label="item.value">{{
                item.label
              }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" @click="handleSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="RepairHandleDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { Repair } from "@/api/interface/service/repair";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import { useUserStore } from "@/stores/modules/user";
const { t } = useI18n(); // 解构出t方法

const userInfo = useUserStore().userInfo;

const rules = reactive({
  repairType: [{ required: true, message: t("main.inputError", { msg: "维修类型" }) }],
  repairState: [{ required: true, message: t("main.selectError", { msg: "维修状态" }) }],
  repairTime: [{ required: true, message: t("main.selectError", { msg: "维修时间" }) }]
});

interface DrawerProps {
  title: string;
  rowData: Partial<Repair.ResRepair>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  repairTypeOptions?: DictOptions[];
  repairStatusOptions?: DictOptions[];
}

const repairArea = ref<string>();

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  rowData: {
    tel: "",
    createBy: ""
  }
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  params.rowData.repairState = 1;
  repairArea.value = params.rowData.repairArea + "-" + params.rowData.roomNo;
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    const formData = { ...drawerProps.value.rowData };
    formData.repairMan = userInfo.user.nickName;
    formData.repairManId = userInfo.user.userId;
    formData.readStatus = "1";
    try {
      await drawerProps.value.api!(formData);
      ElMessage.success({
        message: t("main.successMsg", { title: "报修单", method: `${drawerProps.value.title}` })
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
