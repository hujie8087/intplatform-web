<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="880" :title="`${drawerProps.title}任务`">
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
        <el-col :span="12">
          <el-form-item label="任务名称" prop="jobName">
            <el-input v-model="drawerProps.rowData!.jobName" placeholder="请填写任务名称" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="任务分组" prop="jobGroup">
            <el-select v-model="drawerProps.rowData!.jobGroup" placeholder="请选择任务分组" clearable style="width: 100%">
              <el-option v-for="item in drawerProps.sys_job_group" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="调用方法" prop="invokeTarget">
            <template #label>
              <span>
                调用方法
                <el-tooltip placement="top">
                  <template #content>
                    <div>
                      Bean调用示例：ryTask.ryParams('ry')
                      <br />Class类调用示例：com.ruoyi.quartz.task.RyTask.ryParams('ry')
                      <br />参数说明：支持字符串，布尔类型，长整型，浮点型，整型
                    </div>
                  </template>
                  <el-icon><question-filled /></el-icon>
                </el-tooltip>
              </span>
            </template>
            <el-input v-model="drawerProps.rowData!.invokeTarget" placeholder="请输入调用方法" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="cron表达式" prop="cronExpression">
            <el-input v-model="drawerProps.rowData!.cronExpression" placeholder="请输入cron表达式" clearable>
              <template #append>
                <el-button type="primary" @click="openCrontabDialog()">
                  生成表达式 <el-icon><Clock /></el-icon>
                </el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="drawerProps.rowData!.status">
              <el-radio v-for="dict in drawerProps.sys_job_status" :key="dict.value" :label="dict.value">{{
                dict.label
              }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="执行策略" prop="misfirePolicy">
            <el-radio-group v-model="drawerProps.rowData!.misfirePolicy">
              <el-radio-button label="1">立即执行</el-radio-button>
              <el-radio-button label="2">执行一次</el-radio-button>
              <el-radio-button label="3">放弃执行</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否并发" prop="concurrent">
            <el-radio-group v-model="drawerProps.rowData!.concurrent">
              <el-radio-button label="0">允许</el-radio-button>
              <el-radio-button label="1">禁止</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" v-show="!drawerProps.isView" @click="handleSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
  <CrontabDialog ref="crontabDialogRef" />
</template>

<script setup lang="ts" name="JobDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import CrontabDialog from "./CrontabDialog.vue";
import { useI18n } from "vue-i18n";
import { Task } from "@/api/interface/monitor";
import { DictOptions } from "@/api/interface";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  jobName: [{ required: true, message: "请输入任务名称" }],
  jobGroup: [{ required: true, message: "请选择任务分组" }],
  invokeTarget: [{ required: true, message: "请填写调用方法" }],
  cronExpression: [{ required: true, message: "请输入cron执行表达式" }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData?: Partial<Task.ResTask>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  sys_job_status?: DictOptions[];
  sys_job_group?: DictOptions[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: ""
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  if (!params.rowData?.jobId) {
    drawerProps.value.rowData!.misfirePolicy = "1";
    drawerProps.value.rowData!.concurrent = "1";
    drawerProps.value.rowData!.status = "0";
  }
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!(drawerProps.value.rowData);
      ElMessage.success({
        message: t("main.successMsg", { title: "任务", method: `${drawerProps.value.title}` })
      });
      drawerProps.value.getTableList!();
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

const crontabFill = (value: string) => {
  drawerProps.value.rowData!.cronExpression = value;
};

const expression = ref("");
// 打开 Cron表达式生成器
const crontabDialogRef = ref<InstanceType<typeof CrontabDialog> | null>(null);
const openCrontabDialog = () => {
  const params = {
    crontabFill: crontabFill,
    expression: expression.value
  };
  crontabDialogRef.value?.acceptParams(params);
};

defineExpose({
  acceptParams
});
</script>
