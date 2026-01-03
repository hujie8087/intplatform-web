<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}资源`">
    <el-form ref="ruleFormRef" label-width="120px" label-suffix=" :" :rules="rules" :model="drawerProps.rowData">
      <el-row>
        <el-col :span="24">
          <el-form-item label="资源类型" prop="typeId">
            <el-select v-model="drawerProps.rowData.resourceType" placeholder="请选择">
              <el-option
                v-for="item in drawerProps.resourceTypeOptions"
                :label="item.label"
                :value="item.value"
                :key="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="资源标识" prop="resourceKey">
            <!-- 选择报修人 -->
            <el-input v-model="drawerProps.rowData.resourceKey" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="名称" prop="resourceName">
            <!-- 选择报修人 -->
            <el-input v-model="drawerProps.rowData.resourceName" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="内容类型" prop="contentType">
            <!-- 选择报修人 -->
            <el-select v-model="drawerProps.rowData.contentType" placeholder="请选择">
              <el-option v-for="item in drawerProps.contentTypeOptions" :label="item.label" :value="item.value" :key="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="drawerProps.rowData.contentType === 'IMAGE'">
          <el-form-item label="图片" prop="content">
            <UploadImg v-model:image-url="drawerProps.rowData.content" :file-size="5" width="100px" height="100px">
              <template #tip> 上传图片最大为 5M </template>
            </UploadImg>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="drawerProps.rowData.contentType === 'TEXT'">
          <el-form-item label="内容" prop="content">
            <el-input :rows="5" v-model="drawerProps.rowData.content" type="textarea" />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="drawerProps.rowData.contentType === 'LINK'">
          <el-form-item label="链接" prop="content">
            <el-input v-model="drawerProps.rowData.content" />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="drawerProps.rowData.contentType === 'JSON'">
          <el-form-item label="JSON" prop="content">
            <el-input :rows="5" v-model="drawerProps.rowData.content" type="textarea" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="适用平台" prop="platform">
            <!-- 去掉前后空格 -->
            <el-radio-group v-model="drawerProps.rowData.platform">
              <el-radio v-for="item in drawerProps.platformOptions" :key="item.value" :label="item.value">{{
                item.label
              }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="排序" prop="sortOrder">
            <el-input-number v-model="drawerProps.rowData.sortOrder" :min="0" :max="9999" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="状态" prop="status">
            <el-switch
              v-model="drawerProps.rowData.status"
              :active-value="0"
              :inactive-value="1"
              active-color="#13ce66"
              inactive-color="#ff4949"
            >
            </el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="扩展信息" prop="extInfo">
            <el-input v-model="drawerProps.rowData.extInfo" />
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

<script setup lang="ts" name="AppResourceDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { AppResource } from "@/api/interface/system";
import { DictOptions } from "@/api/interface";
import UploadImg from "@/components/Upload/Img.vue";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({});

interface DrawerProps {
  title: string;
  rowData: Partial<AppResource.ResAppResource>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  resourceTypeOptions?: DictOptions[];
  platformOptions?: DictOptions[];
  contentTypeOptions?: DictOptions[];
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

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    const formData = {
      ...drawerProps.value.rowData
    };
    try {
      await drawerProps.value.api!(formData);
      ElMessage.success({
        message: t("main.successMsg", { title: "App菜单", method: `${drawerProps.value.title}` })
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
