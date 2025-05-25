<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}失物招领`">
    <el-form ref="ruleFormRef" label-width="120px" label-suffix=" :" :rules="rules" :model="drawerProps.rowData">
      <el-row>
        <el-col :span="24">
          <el-form-item label="失物名称" prop="lostName">
            <el-input v-model="drawerProps.rowData.lostName" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="失物数量" prop="lostNum">
            <el-input-number v-model="drawerProps.rowData.lostNum" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="失物地点" prop="foundPlace">
            <el-input v-model="drawerProps.rowData.foundPlace" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="失物联系人" prop="foundName">
            <!-- 选择报修人 -->
            <el-input v-model="drawerProps.rowData.foundName" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="联系电话" prop="foundPhone">
            <!-- 选择报修人 -->
            <el-input v-model="drawerProps.rowData.tel" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="图片" prop="photo">
            <UploadImg
              v-model:image-url="drawerProps.rowData!.photo"
              :file-size="5"
              width="100px"
              height="100px"
              :api="uploadByfName"
              file-label="files"
              folder-name="lostFound"
              :on-success="handleSuccess"
              :on-error="handleError"
            >
              <template #tip> 上传图片最大为 5M </template>
            </UploadImg>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="失物描述" prop="def1">
            <el-input type="textarea" :rows="4" v-model="drawerProps.rowData.def1" clearable />
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

<script setup lang="ts" name="OtherDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { Found } from "@/api/interface/service/found";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import UploadImg from "@/components/Upload/Imgs.vue";
import { uploadByfName } from "@/api/modules/upload";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  lostName: [{ required: true, message: t("main.inputError", { msg: "请填写失物名称" }) }],
  tel: [{ required: true, message: t("main.inputError", { msg: "请填写联系电话" }) }],
  lostNum: [{ required: true, message: t("main.inputError", { msg: "请填写失物数量" }) }]
});

interface DrawerProps {
  title: string;
  rowData: Partial<Found.ResFound>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  otherTypeOptions?: DictOptions[];
  treeData?: {
    [key: string]: any;
  }[];
}

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
};

// 图片上传成功
const handleSuccess = (res: any) => {
  console.log(res);
  drawerProps.value.rowData!.photo = res.data.map((item: any) => item.url).join(",");
};

// 图片上传失败
const handleError = (err: any) => {
  console.log(err);
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    const formData = { ...drawerProps.value.rowData };
    try {
      await drawerProps.value.api!(formData);
      ElMessage.success({
        message: t("main.successMsg", { title: "失物招领", method: `${drawerProps.value.title}` })
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
