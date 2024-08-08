<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}报修单`">
    <el-form ref="ruleFormRef" label-width="120px" label-suffix=" :" :rules="rules" :model="drawerProps.rowData">
      <el-row>
        <el-col :span="24">
          <el-form-item label="报修区域" prop="repairArea">
            <el-cascader
              v-model="drawerProps.rowData.repairArea"
              :options="drawerProps.treeData"
              style="width: 100%"
              filterable
              :props="{
                label: 'title',
                children: 'children',
                checkStrictly: true,
                value: 'id'
              }"
              @change="handleChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="报修人" prop="repairPerson">
            <!-- 选择报修人 -->
            <el-input v-model="drawerProps.rowData.repairPerson" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="联系电话" prop="tel">
            <!-- 选择报修人 -->
            <el-input v-model="drawerProps.rowData.tel" />
          </el-form-item>
        </el-col>
        <el-form-item label="报修图片" prop="repairPhoto">
          <UploadImgs v-model:file-list="fileList" width="200px">
            <template #empty>
              <el-icon><Picture /></el-icon>
              <span>请上传照片</span>
            </template>
            <template #tip> 可拖拽上传 </template>
          </UploadImgs>
        </el-form-item>
        <el-col :span="24">
          <el-form-item label="报修说明" prop="repairMessage">
            <el-input v-model="drawerProps.rowData!.repairMessage" type="textarea" clearable />
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
import { ElMessage, FormInstance, UploadUserFile } from "element-plus";
import { Repair } from "@/api/interface/service/repair";
import { useI18n } from "vue-i18n";
import UploadImgs from "@/components/Upload/Imgs.vue";
const { t } = useI18n(); // 解构出t方法

const fileList = ref<UploadUserFile[]>([]);
const rules = reactive({
  repairArea: [{ required: true, message: t("main.inputError", { msg: "报修区域" }) }],
  repairPerson: [{ required: true, message: t("main.selectError", { msg: "报修说明" }) }],
  tel: [{ required: true, message: t("main.selectError", { msg: "报修联系电话" }) }]
});

interface DrawerProps {
  title: string;
  rowData: Partial<Repair.ResRepair>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  treeData?: {
    [key: string]: any;
  }[];
}

const repairArea = ref<string>();
const handleChange = value => {
  drawerProps.value.rowData.repairAreaId = value[0];
  drawerProps.value.rowData.repairRoomId = value[value.length - 1];
  drawerProps.value.rowData.repairArea = drawerProps.value.treeData?.find(item => item.id === value[0])?.title;
};
// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  rowData: {}
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  fileList.value = [];
  repairArea.value = params.rowData.repairArea + "-" + params.rowData.roomNo;
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    const formData = { ...drawerProps.value.rowData };
    formData.repairPhoto = fileList.value.map(item => item.url).join(",");
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
