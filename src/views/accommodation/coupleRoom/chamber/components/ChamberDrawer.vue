<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}客房`">
    <el-form ref="ruleFormRef" label-width="120px" label-suffix=" :" :rules="rules" :model="drawerProps.rowData">
      <el-row>
        <el-col :span="12">
          <el-form-item label="所属区域" prop="areaType">
            <el-select v-model="drawerProps.rowData.areaType" clearable>
              <el-option v-for="item in drawerProps.coupleRoomArea" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="!drawerProps.isBatchAdd">
          <el-form-item label="房间名称" prop="name">
            <el-input v-model="drawerProps.rowData.name" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-else>
          <el-form-item label="房号范围" prop="roomRange" title="格式：101-110、eg101-110、CN26-103-105">
            <el-input v-model="drawerProps.rowData.roomRange" placeholder="格式：101-110、eg101-110、CN26-103-105" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="日期" prop="lastTime">
            <el-date-picker v-model="drawerProps.rowData.lastTime" format="YYYY-MM-DD" value-format="YYYY-MM-DD" type="date" />
          </el-form-item>
        </el-col>
        <!-- 状态 -->
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-switch v-model="drawerProps.rowData.status" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </el-col>
        <!-- 备注 -->
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input type="textarea" :rows="4" v-model="drawerProps.rowData.remark" clearable />
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

<script setup lang="ts" name="ProcessDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import { CoupleRoom } from "@/api/interface/service/coupleRoom";
const { t } = useI18n(); // 解构出t方法
const rules = reactive({
  areaType: [{ required: true, message: t("main.inputError", { msg: "所属区域" }) }],
  name: [{ required: true, message: t("main.inputError", { msg: "房间名称" }) }],
  roomRange: [{ required: true, message: t("main.inputError", { msg: "格式：101-110、eg101-110、CN26-103-10" }) }],
  lastTime: [{ required: true, message: t("main.inputError", { msg: "日期" }) }],
  status: [{ required: true, message: t("main.inputError", { msg: "请选择状态" }) }]
});

interface DrawerProps {
  title: string;
  rowData: Partial<CoupleRoom.ResRoom> & { roomRange?: string };
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  coupleRoomArea?: DictOptions[];
  isBatchAdd?: boolean;
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  rowData: {}
});
const content = ref("");
const requirements = ref("");
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
    const formData = { ...drawerProps.value.rowData, content: content.value, requirements: requirements.value };
    try {
      await drawerProps.value.api!(formData);
      ElMessage.success({
        message: t("main.successMsg", { title: "客房", method: `${drawerProps.value.title}` })
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
