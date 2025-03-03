<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="1080" :title="`${drawerProps.rowData.videoName}视频管理`">
    <ProTable ref="proTable" title="用户列表" highlight-current-row :columns="columns" :data="tableData" :show-summary="true">
      <!-- 表格 header 按钮 -->
      <template #tableHeader>
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
          <el-button type="primary" :loading="progress !== 0 && progress !== 100" :icon="CirclePlus">上传视频</el-button>
        </el-upload>
        <el-button type="danger" :icon="Delete"> 批量删除视频 </el-button>
      </template>
      <!-- Expand -->
      <template #expand="scope">
        {{ scope.row }}
      </template>
      <!-- 表格操作 -->
      <template #operation>
        <el-button type="primary" link :icon="View">查看</el-button>
        <el-button type="primary" link :icon="Delete">删除</el-button>
      </template>
    </ProTable>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" @click="handleSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="VideoDetailsDrawer">
import { ref, reactive } from "vue";
import { UploadFile, UploadUserFile } from "element-plus";
import { Gather } from "@/api/interface/video";
import { ColumnProps } from "@/components/ProTable/interface";
import { useUserStore } from "@/stores/modules/user";
import { CirclePlus, Delete, View } from "@element-plus/icons-vue";

const progress = ref(0);
const handleProgress = event => {
  progress.value = Math.round((event.loaded / event.total) * 100);
};
const tableData = ref<Gather.GatherDetailCreate[]>([]);
const userStore = useUserStore();
const baseUrl = import.meta.env.VITE_API_URL;
const fileList = ref<UploadUserFile[]>([]);
// 表格配置项
const columns = reactive<ColumnProps<Gather.GatherDetail>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 80 },
  {
    prop: "dTitle",
    label: "视频标题"
  },
  { prop: "sourcePath", label: "视频原路径" },
  {
    prop: "sort",
    label: "排序"
  },
  {
    prop: "scoreNum",
    label: "评分人数"
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

interface DrawerProps {
  rowData: Partial<Gather.ResGather>;
}
// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  rowData: {}
});

// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

// 提交数据（新增/编辑）
const handleSubmit = () => {
  //   ruleFormRef.value!.validate(async valid => {
  //     if (!valid) return;
  //     try {
  //       await drawerProps.value.api!(drawerProps.value.rowData);
  //       ElMessage.success({
  //         message: t("main.successMsg", { title: "视频", method: `${drawerProps.value.title}` })
  //       });
  //       drawerProps.value.getTableList!();
  //       drawerVisible.value = false;
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   });
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
defineExpose({
  acceptParams
});
</script>
