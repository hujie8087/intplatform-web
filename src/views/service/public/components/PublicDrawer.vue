<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}公共服务项`">
    <el-form ref="ruleFormRef" label-width="120px" label-suffix=" :" :rules="rules" :model="drawerProps.rowData">
      <el-row>
        <el-col :span="24">
          <el-form-item label="服务类型" prop="souceType">
            <!-- 选择维修类型 -->
            <el-select v-model="drawerProps.rowData.souceType" placeholder="请选择服务类型" clearable>
              <el-option v-for="item in drawerProps.otherTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="所属区域" prop="regionId">
            <el-select v-model="drawerProps.rowData.regionId" placeholder="请选择所属区域" clearable @change="handleChange">
              <el-option v-for="item in drawerProps.treeData" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="负责人" prop="head">
            <!-- 选择报修人 -->
            <el-input v-model="drawerProps.rowData.head" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="联系电话" prop="telephone">
            <!-- 选择报修人 -->
            <el-input v-model="drawerProps.rowData.telephone" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="营业时间" prop="businessHours">
            <el-input v-model="drawerProps.rowData!.businessHours" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="详细地址" prop="address">
            <el-input v-model="drawerProps.rowData.address" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="图片" prop="image">
            <UploadImg v-model:image-url="drawerProps.rowData.image" width="100px" height="100px"> </UploadImg>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="轮播图片" prop="def1">
            <UploadImgs
              v-model:file-list="fileList1"
              :file-size="20"
              width="100px"
              height="100px"
              :api="uploadFlora"
              file-label="file"
              @update:file-list="updateImage"
            >
              <template #tip> 上传图片最大为 20M </template>
            </UploadImgs>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="详细说明" prop="details">
            <WangEditor v-model:value="details" height="400px" />
          </el-form-item>
        </el-col>
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

<script setup lang="ts" name="OtherDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { Other } from "@/api/interface/service/other";
import WangEditor from "@/components/WangEditor/index.vue";
import UploadImg from "@/components/Upload/Img.vue";
import UploadImgs from "@/components/Upload/Imgs.vue";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import { uploadFlora } from "@/api/modules/upload";
const { t } = useI18n(); // 解构出t方法

const fileList1 = ref<any[]>([]);
const rules = reactive({
  head: [{ required: true, message: t("main.inputError", { msg: "请填写负责人" }) }],
  souceType: [{ required: true, message: t("main.selectError", { msg: "请选择服务类型" }) }],
  businessHours: [{ required: true, message: t("main.inputError", { msg: "请填写营业时间" }) }],
  regionId: [{ required: true, message: t("main.inputError", { msg: "请选择所属区域" }) }],
  address: [{ required: true, message: t("main.inputError", { msg: "详细地址" }) }],
  telephone: [{ required: true, message: t("main.inputError", { msg: "联系电话" }) }]
});

interface DrawerProps {
  title: string;
  rowData: Partial<Other.ResOther>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  otherTypeOptions?: DictOptions[];
  treeData?: {
    [key: string]: any;
  }[];
}

const handleChange = value => {
  console.log(value);
  drawerProps.value.rowData.region = drawerProps.value.treeData?.find(item => item.id === value)?.title;
};
// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  rowData: {}
});
const details = ref("");
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  details.value = params.rowData.details ?? "";
  fileList1.value = params.rowData.def1 ? params.rowData.def1.split(",").map(item => ({ url: item })) : [];
};

const updateImage = (value: any[]) => {
  fileList1.value = value.map(item => {
    return {
      ...item,
      url: item.response?.url || item.url
    };
  });
};
// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    drawerProps.value.rowData.def1 = fileList1.value.map(item => item.url).join(",");
    const formData = { ...drawerProps.value.rowData, details: details.value };
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
