<template>
  <div class="card content-box">
    <el-form ref="ruleFormRef" label-width="120px" label-suffix=" :" :rules="rules" :model="createGatherForm" style="width: 100%">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-col :span="24">
            <el-form-item label="视频名称" prop="videoName">
              <el-input
                v-model="createGatherForm.videoName"
                :placeholder="`${$t('main.inputError', { msg: '视频类型名称' })}`"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="视频分类" prop="type">
              <el-select v-model="createGatherForm.type" placeholder="请选择视频分类">
                <el-option v-for="item in videoTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="视频描述" prop="description">
              <el-input type="textarea" v-model="createGatherForm.description" placeholder=""></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="视频封面" prop="coverPath">
              <UploadImg v-model:image-url="createGatherForm.coverPath" :file-size="5" width="100px" height="100px">
                <template #tip> 上传图片最大为 5M </template>
              </UploadImg>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="视频标签" prop="labelIds">
              <SelectFilter :data="selectFilterData" :default-values="selectFilterValues" @change="changeSelectFilter" />
            </el-form-item>
          </el-col>
        </el-col>
        <el-col :span="12">
          <div class="table-header" style="margin-bottom: 10px">
            <el-upload
              v-model:file-list="fileList"
              class="upload-demo"
              :action="baseUrl + '/file/uploadVideo'"
              :headers="{
                Authorization: 'Bearer ' + userStore.token
              }"
              :limit="1"
              :show-file-list="false"
              :on-success="handleSuccess"
              :on-progress="handleProgress"
              style="display: inline-block; margin-right: 10px; vertical-align: middle"
            >
              <el-button type="primary" :icon="CirclePlus">上传视频</el-button>
            </el-upload>
            <el-button type="danger" :icon="Delete"> 批量删除视频 </el-button>
          </div>
          <div v-if="progress > 0"><el-progress :stroke-width="8" :percentage="progress" /></div>
          <el-table :data="tableData" border>
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column prop="dTitle" label="标题" align="center" />
            <el-table-column prop="sourcePath" label="视频原路径" align="center" />
            <el-table-column prop="h264" label="h264格式路径" align="center" />
            <el-table-column prop="m3u8" label="m3u8格式路径" align="center" />
            <el-table-column prop="remark" label="备注" align="center" />
            <el-table-column label="操作" align="center">
              <!-- 表格操作 -->
              <template #default>
                <el-button type="primary" link :icon="View">查看</el-button>
                <el-button type="primary" link :icon="Delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
        <el-col :span="24" style="margin-top: 20px">
          <el-form-item>
            <el-button type="primary" @click="handleSubmit" :loading="submitLoading">提交</el-button>
            <el-button @click="closeDrawer">关闭</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance, UploadFile, UploadUserFile } from "element-plus";
import { useI18n } from "vue-i18n";
import { Gather } from "@/api/interface/video";
import UploadImg from "@/components/Upload/Img.vue";
import { DictOptions } from "@/api/interface";
import SelectFilter from "@/components/SelectFilter/index.vue";
import { editGather, getGatherDetail, getVideoLabelList, getVideoTypeList } from "@/api/modules/video";
import { useDict } from "@/hooks/useDict";
import { useTabsStore } from "@/stores/modules/tabs";
import { useRoute } from "vue-router";
import { CirclePlus, Delete, View } from "@element-plus/icons-vue";
import { useUserStore } from "@/stores/modules/user";
import { onBeforeMount } from "vue";
const { t } = useI18n(); // 解构出t方法

const progress = ref(0);
const handleProgress = event => {
  console.log(event.loaded, event.total);

  progress.value = Math.round((event.loaded / event.total) * 100);
};
const userStore = useUserStore();
const baseUrl = import.meta.env.VITE_API_URL;
const tabStore = useTabsStore();
const route = useRoute();
const fileList = ref<UploadUserFile[]>([]);
const rules = reactive({
  videoName: [{ required: true, message: t("main.inputError", { msg: "视频名称" }) }],
  type: [{ required: true, message: t("main.inputError", { msg: "视频分类" }) }],
  description: [{ required: true, message: t("main.inputError", { msg: "视频描述" }) }],
  coverPath: [{ required: true, message: "请上传视频封面" }]
});
const tableData = ref<Gather.GatherDetail[]>([]);
const submitLoading = ref(false);
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

interface VideoCollection {
  [key: string]: number[];
}
const createGatherForm = ref<Gather.ResGather>({
  videoName: "",
  type: 0,
  description: "",
  coverPath: "",
  labelIds: "",
  remark: "",
  playVolume: 0,
  score: 0,
  scoreNum: 0,
  releaseYear: "",
  ranscode: 0,
  videoGatherDetails: []
});

// 字典数据
const video_label_type = ref<DictOptions[]>([]);
useDict("video_label_type").then(res => {
  video_label_type.value = res.video_label_type;
});
const defaultIds = ref<string[]>([]);
const getGatherDetailData = async () => {
  const res = await getGatherDetail(route.query.id as string);
  createGatherForm.value = res.data;
  defaultIds.value = res.data.labelIds ? res.data.labelIds.split(",") : [];
  tableData.value = res.data.videoGatherDetails || [];
};
const selectFilterData = ref<SelectDataProps[]>([]);
const getVideoLabelOptions = async () => {
  const res = await getVideoLabelList({ pageNum: 1, pageSize: 100000 });
  selectFilterData.value = video_label_type.value.map(item => {
    return {
      title: item.label,
      key: "video" + item.value,
      multiple: item.cssClass === "1",
      options: [
        { label: "全部", value: "" },
        ...res.rows
          .filter(label => label.labelType === item.value)
          .map(val => {
            return {
              label: val.labelName,
              value: val.id.toString(),
              icon: ""
            };
          })
      ]
    };
  }) as SelectDataProps[];
  selectFilterValues.value = selectFilterData.value.reduce((acc, cur) => {
    let defaultValue = cur.options
      .filter(item => defaultIds.value.includes(item.value.toString()))
      .map(item => item.value.toString());
    acc[cur.key] = defaultValue.length ? defaultValue : [""];
    return acc;
  }, {});
};
// 获取视频分类
const videoTypeList = ref<DictOptions[]>([]);
const getVideoTypeOptions = async () => {
  const res = await getVideoTypeList({ pageNum: 1, pageSize: 100000 });
  videoTypeList.value = res.rows.map(item => {
    return {
      value: item.id,
      label: item.typeName,
      tagType: ""
    } as DictOptions;
  });
};
onBeforeMount(() => {
  if (route.query.id) {
    route.meta.name = "编辑视频";
    getGatherDetailData();
  }
  getVideoLabelOptions();
  getVideoTypeOptions();
});

const selectFilterValues = ref<VideoCollection>();
// 视频标签选择
const changeSelectFilter = (value: typeof selectFilterValues.value) => {
  selectFilterValues.value = value;
  let ids: number[] = [];
  for (const key in value) {
    ids = ids.concat(value[key]);
  }
  createGatherForm.value.labelIds = ids.filter(item => item).join(",");
};

const closeDrawer = () => {
  tabStore.removeTabs(route.fullPath as string);
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      createGatherForm.value.videoGatherDetails = tableData.value;
      await editGather(createGatherForm.value);
      ElMessage.success({
        message: "编辑视频成功"
      });
      closeDrawer();
    } catch (error) {
      console.log(error);
    }
  });
};

const handleSuccess = (response: any, uploadFile: UploadFile) => {
  tableData.value.push({
    dTitle: uploadFile.name,
    sourcePath: response.data.url,
    h264: "",
    m3u8: "",
    remark: ""
  });
};
</script>

<style scoped></style>
