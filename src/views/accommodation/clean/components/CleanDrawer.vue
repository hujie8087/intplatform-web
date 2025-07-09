<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}保洁项目`">
    <el-form ref="ruleFormRef" label-width="120px" label-suffix=" :" :rules="rules" :model="drawerProps.rowData">
      <el-row>
        <el-col :span="24">
          <el-form-item label="收费类别" prop="chargeType">
            <el-select v-model="drawerProps.rowData.chargeType" clearable>
              <el-option
                v-for="item in drawerProps.chargeTypeOptions"
                :key="item.label"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="项目详情" prop="projectDetails">
            <el-input v-model="drawerProps.rowData.projectDetails" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="收费价格" prop="chargePrice">
            <el-input-number v-model="drawerProps.rowData.chargePrice" :min="0" :max="999999" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="收费方式" prop="chargeMethod">
            <el-input v-model="drawerProps.rowData.chargeMethod" clearable />
          </el-form-item>
        </el-col>
        <!-- 是否登录 -->
        <el-col :span="24">
          <el-form-item label="所属公司" prop="belongingCompany">
            <el-input v-model="drawerProps.rowData.belongingCompany" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="所属区域" prop="ancestors">
            <el-select
              v-model="repairAreaIds"
              multiple
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="5"
              placeholder="请选择"
              @change="handleAncestorsChange"
            >
              <el-option v-for="item in drawerProps.buildingOptions" :label="item.title" :value="item.id" :key="item.id">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 状态 -->
        <el-col :span="24">
          <el-form-item label="状态" prop="status">
            <el-switch v-model="drawerProps.rowData.status" :active-value="0" :inactive-value="1" />
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
import { Accommodation } from "@/api/interface/service/accommodation";
import { Building } from "@/api/interface/productDisplay/building";
const { t } = useI18n(); // 解构出t方法
const rules = reactive({
  chargeType: [{ required: true, message: t("main.inputError", { msg: "请填写收费类别" }) }],
  projectDetails: [{ required: true, message: t("main.inputError", { msg: "请填写项目详情" }) }],
  chargePrice: [{ required: true, message: t("main.inputError", { msg: "请填写收费价格" }) }],
  chargeMethod: [{ required: true, message: t("main.inputError", { msg: "请填写收费方式" }) }],
  belongingCompany: [{ required: true, message: t("main.inputError", { msg: "请填写所属公司" }) }],
  status: [{ required: true, message: t("main.inputError", { msg: "请选择状态" }) }],
  ancestors: [{ required: true, message: t("main.inputError", { msg: "请填写所属区域" }) }]
});

interface DrawerProps {
  title: string;
  rowData: Partial<Accommodation.ResClean>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  chargeTypeOptions?: DictOptions[];
  buildingOptions?: Building.ResBuilding[];
}

const repairAreaIds = ref<number[]>([]);

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
  repairAreaIds.value = params.rowData.ancestors ? params.rowData.ancestors?.split(",").map(item => Number(item)) : [];
};

const handleAncestorsChange = (value: number[]) => {
  drawerProps.value.rowData.ancestors = value.join(",");
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
        message: t("main.successMsg", { title: "住宿流程", method: `${drawerProps.value.title}` })
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
