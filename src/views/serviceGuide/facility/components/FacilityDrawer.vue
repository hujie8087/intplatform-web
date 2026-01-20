<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}配套设施`">
    <el-form ref="ruleFormRef" label-width="120px" label-suffix=" :" :rules="rules" :model="drawerProps.rowData">
      <el-row>
        <el-col :span="24">
          <el-form-item label="配套设施类型" prop="typeId">
            <el-select v-model="drawerProps.rowData.typeId" placeholder="请选择">
              <el-option v-for="item in drawerProps.guideTypeOptions" :label="item.label" :value="item.value" :key="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="名称" prop="title">
            <!-- 选择报修人 -->
            <el-input v-model="drawerProps.rowData.title" />
          </el-form-item>
        </el-col>
        <el-form-item label="图片" prop="img">
          <UploadImg
            v-model:file-list="fileList1"
            :file-size="20"
            width="100px"
            height="100px"
            :api="uploadFlora"
            file-label="file"
            @update:file-list="updateImage"
          >
            <template #tip> 上传图片最大为 20M </template>
          </UploadImg>
        </el-form-item>
        <el-col :span="24">
          <el-form-item label="地址" prop="file">
            <el-input v-model="drawerProps.rowData.file" placeholder="请输入地址" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="说明" prop="content">
            <WangEditor v-model:value="content" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="drawerProps.rowData.sort" controls-position="right" style="width: 100px" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="状态" prop="status">
            <el-switch
              v-model="drawerProps.rowData.status"
              active-value="0"
              inactive-value="1"
              active-color="#13ce66"
              inactive-color="#ff4949"
            >
            </el-switch>
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
import { useI18n } from "vue-i18n";
import { Guide } from "@/api/interface/serviceGuide";
import WangEditor from "@/components/WangEditor/index.vue";
import { DictOptions } from "@/api/interface";
import UploadImg from "@/components/Upload/Imgs.vue";
import { uploadFlora } from "@/api/modules/upload";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  title: [{ required: true, message: t("main.inputError", { msg: "名称" }) }],
  typeId: [{ required: true, message: t("main.selectError", { msg: "类型" }) }],
  status: [{ required: true, message: t("main.selectError", { msg: "状态" }) }]
});

interface DrawerProps {
  title: string;
  rowData: Partial<Guide.ResGuide>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  guideTypeOptions?: DictOptions[];
}
const content = ref("");
const fileList1 = ref<any[]>([]);
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
  content.value = params.rowData.content || "";
  fileList1.value = params.rowData.img ? params.rowData.img.split(",").map(item => ({ url: item })) : [];
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
    drawerProps.value.rowData.img = fileList1.value.map(item => item.url).join(",");
    const formData = { ...drawerProps.value.rowData, content: content.value };
    try {
      await drawerProps.value.api!(formData);
      ElMessage.success({
        message: t("main.successMsg", { title: "配套设施", method: `${drawerProps.value.title}` })
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
