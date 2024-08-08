<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="1080" :title="`${drawerProps.title}视频类型`">
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
          <el-form-item label="视频名称" prop="videoName">
            <el-input
              v-model="drawerProps.rowData.videoName"
              :placeholder="`${$t('main.inputError', { msg: '视频类型名称' })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="视频分类" prop="type">
            <el-select v-model="drawerProps.rowData.type" placeholder="请选择视频分类">
              <el-option
                v-for="item in drawerProps.videoTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="视频描述" prop="description">
            <el-input type="textarea" rows="10" v-model="drawerProps.rowData.description" placeholder=""></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="视频封面" prop="coverPath">
            <UploadImg v-model:image-url="drawerProps.rowData.coverPath" :file-size="5" width="100px" height="100px">
              <template #tip> 上传图片最大为 5M </template>
            </UploadImg>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="视频标签" prop="labelIds">
            <SelectFilter
              :data="drawerProps.selectFilterData"
              :default-values="selectFilterValues"
              @change="changeSelectFilter"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24"> </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" v-show="!drawerProps.isView" @click="handleSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="GatherDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { Gather } from "@/api/interface/video";
import UploadImg from "@/components/Upload/Img.vue";
import { DictOptions } from "@/api/interface";
import SelectFilter from "@/components/SelectFilter/index.vue";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  videoName: [{ required: true, message: t("main.inputError", { msg: "视频名称" }) }],
  type: [{ required: true, message: t("main.inputError", { msg: "视频分类" }) }],
  description: [{ required: true, message: t("main.inputError", { msg: "视频描述" }) }],
  coverPath: [{ required: true, message: "请上传视频封面" }]
});

interface OptionsProps {
  value: string;
  label: string;
  icon?: string;
}

interface SelectDataProps {
  title: string; // 列表标题
  key: string; // 当前筛选项 key 值
  multiple?: boolean; // 是否为多选
  options: OptionsProps[]; // 筛选数据
}

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<Gather.ResGather>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  videoTypeList?: DictOptions[];
  selectFilterData?: SelectDataProps[];
}
interface VideoCollection {
  [key: string]: number[];
}
const selectFilterValues = ref<VideoCollection>();
// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  rowData: {}
});

// 视频标签选择
const changeSelectFilter = (value: typeof selectFilterValues.value) => {
  selectFilterValues.value = value;
  let ids: number[] = [];
  for (const key in value) {
    ids = ids.concat(value[key]);
  }
  drawerProps.value.rowData.labelIds = ids.filter(item => item).join(",");
};
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
      await drawerProps.value.api!(drawerProps.value.rowData);
      ElMessage.success({
        message: t("main.successMsg", { title: "视频", method: `${drawerProps.value.title}` })
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
