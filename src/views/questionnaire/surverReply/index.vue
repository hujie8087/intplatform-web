<template>
  <div class="Reply main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getSurveyReply"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="Plus" v-auth="['survey:replay:add']" @click="addSurveyReplyList('新增')">
            新建问卷回复
          </el-button>
          <el-button type="success" :icon="Download" v-auth="['survey:replay:export']" @click="exportSurveyReply">
            导出问卷回复
          </el-button>
          <el-button
            type="danger"
            :disabled="!scope.isSelected"
            :icon="Delete"
            v-auth="['survey:replay:remove']"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button
            type="primary"
            link
            :icon="EditPen"
            v-auth="['survey:replay:edit']"
            @click="addSurveyReplyList('修改', scope.row)"
            >修改</el-button
          >
          <el-button
            type="danger"
            :icon="Delete"
            link
            v-auth="['survey:replay:remove']"
            @click="deleteSurveyReplyList(scope.row)"
          >
            删除
          </el-button>
        </template>
      </ProTable>
      <el-dialog v-model="dialogShow" :title="dialogTitle" width="30%" class="survey-reply-dialog">
        <el-form ref="surveyReplyFormRef" :model="surverReplyForm" :rules="rules" label-width="100">
          <el-form-item label="项目名称" prop="projectKey">
            <el-select v-model="surverReplyForm.projectKey" placeholder="请选择绑定的项目名称" clearable filterable>
              <el-option v-for="item in projectOption" :label="item.label" :value="item.value" :key="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="问卷回复名称" prop="title">
            <el-input v-model="surverReplyForm.title" placeholder="请输入问卷回复名称" clearable />
          </el-form-item>
          <el-form-item label="日期" class="set-time-class">
            <el-date-picker
              v-model="surverReplyForm.replyDate"
              type="month"
              placeholder="请选择日期"
              value-format="YYYY-MM"
              format="YYYY-MM"
              clearable
            />
          </el-form-item>
          <el-form-item label="图片">
            <UploadImg v-model:image-url="surverReplyForm.url" :file-size="5" width="100px" height="100px">
              <template #tip> 上传图片最大为 5M </template>
            </UploadImg>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="surverReplyForm.remark" type="textarea" :rows="5" placeholder="请输入备注" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="resetForm(surveyReplyFormRef)">取消</el-button>
          <el-button type="primary" @click="submitForm(surveyReplyFormRef)"> 确认 </el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="tsx" name="SurverReply">
import { ref, reactive, onMounted } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { Plus, Delete, EditPen, Download } from "@element-plus/icons-vue";
import { getSurveyReply, addSurveyReply, editSurveyReply, deleteSurveyReply } from "@/api/modules/questionnaire/surveyReply";
import UploadImg from "@/components/Upload/Img.vue";
import { getProjectList } from "@/api/modules/questionnaire/myProject";
import dayjs from "dayjs";
import { useHandleData } from "@/hooks/useHandleData";
import { ElMessageBox } from "element-plus";
import { useDownload } from "@/hooks/useDownload";
const proTable = ref();
const fileUrl = import.meta.env.VITE_APP_BASE_FILE;
const columns = reactive([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 80 },
  {
    prop: "title",
    label: "问卷回复名称",
    search: { el: "input", defaultValue: "" }
  },
  {
    prop: "url",
    label: "图片",
    render: scope => {
      const src = `${fileUrl}${scope.row.url}`;
      return (
        <span>
          <el-image src={src} preview-src-list={[src]} style={{ width: "50px", height: "50px" }} preview-teleported={true} />
        </span>
      );
    }
  },
  {
    prop: "replyDate",
    label: "日期",
    search: {
      el: "date-picker",
      props: { type: "month", valueFormat: "YYYY-MM", clearable: true },
      defaultValue: ""
    }
  },
  {
    prop: "remark",
    label: "备注"
  },
  { prop: "operation", label: "操作", width: 150, fixed: "right" }
]);
const dataCallback = data => {
  return {
    list: data.rows,
    total: data.total
  };
};
const dialogShow = ref(false);
const dialogTitle = ref("新增问卷回复");
const surveyReplyFormRef = ref();
type SurveyPopForm = {
  projectKey: string;
  title: string;
  replyDate: string;
  url: string;
  remark: string;
  id?: number;
  type: string;
};
const surverReplyForm = reactive<SurveyPopForm>({
  projectKey: "",
  title: "",
  replyDate: dayjs().endOf("day").format("YYYY-MM"),
  url: "",
  remark: "",
  type: "新增"
});
const rules = reactive({
  title: [{ required: true, message: "请输入问卷回复名称", trigger: "blur" }],
  projectKey: [
    {
      required: true,
      message: "请选择绑定的项目名称",
      trigger: "change"
    }
  ]
});
interface ProjectType {
  label: string;
  value: string;
}
const projectOption = ref<ProjectType[]>([]);
const addSurveyReplyList = (type, row?: any) => {
  dialogShow.value = true;
  surverReplyForm.type = type;
  if (type == "新增") {
    dialogTitle.value = "新增问卷回复";
    delete surverReplyForm.id;
  } else {
    let { projectKey, title, replyDate, url, remark, id } = row;
    Object.assign(surverReplyForm, { projectKey, title, replyDate, url, remark, id });
    dialogTitle.value = "修改问卷回复";
  }
};
const submitForm = formEl => {
  if (!formEl) return;
  formEl.validate(async (valid, fields) => {
    if (valid) {
      if (surverReplyForm.type == "新增") {
        await addSurveyReply(surverReplyForm);
      } else {
        await editSurveyReply(surverReplyForm);
      }

      dialogShow.value = false;
      proTable.value?.getTableList();
    } else {
      console.log("error submit!", fields);
    }
  });
};
const resetForm = formEl => {
  if (!formEl) return;
  formEl.resetFields();
  dialogShow.value = false;
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteSurveyReply, ids, `批量删除问卷回复数据`);
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};
// 删除单条
const deleteSurveyReplyList = async params => {
  await useHandleData(deleteSurveyReply, params.id.toString(), `删除【${params.title}】这条数据`);
  proTable.value?.getTableList();
};
const exportSurveyReply = async () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  ElMessageBox.confirm("确认导出问卷回复?", "温馨提示", { type: "warning" }).then(() =>
    useDownload(`${baseUrl}survey/project/reply/export`, "回复列表", true, ".xlsx", "post", proTable.value?.searchParam)
  );
};

onMounted(() => {
  getProjectNameOption();
});
const getProjectNameOption = async () => {
  let data: any = await getProjectList({ pageNum: 1, pageSize: 999999 });
  let row = data?.rows ?? [];
  projectOption.value = row.map(item => ({
    label: item.projectName,
    value: item.projectKey
  }));
};
</script>

<style lang="scss" scoped>
.set-time-class {
  :deep(.el-input) {
    width: 100%;
  }
}
</style>
