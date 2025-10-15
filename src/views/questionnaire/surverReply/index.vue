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
          <el-button type="primary" :icon="Plus" v-auth="['survey:reply:add']" @click="addSurveyReplyList('新增')">
            {{ $t("main.add") }}
          </el-button>
          <el-button type="success" :icon="Download" v-auth="['survey:reply:export']" @click="exportSurveyReply">
            {{ $t("main.downloadClick") }}
          </el-button>
          <el-button
            type="danger"
            :disabled="!scope.isSelected"
            :icon="Delete"
            v-auth="['survey:reply:remove']"
            @click="batchDelete(scope.selectedListIds)"
          >
            {{ $t("main.batchDelete") }}
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button
            type="primary"
            link
            :icon="EditPen"
            v-auth="['survey:reply:edit']"
            @click="addSurveyReplyList('修改', scope.row)"
          >
            {{ $t("main.edit") }}
          </el-button>
          <el-button type="danger" :icon="Delete" link v-auth="['survey:reply:remove']" @click="deleteSurveyReplyList(scope.row)">
            {{ $t("main.delete") }}
          </el-button>
        </template>
      </ProTable>
      <el-dialog v-model="dialogShow" :title="dialogTitle" width="30%" class="survey-reply-dialog">
        <el-form ref="surveyReplyFormRef" :model="surverReplyForm" :rules="rules" label-width="120">
          <el-form-item :label="$t('survey.reply.belong')" prop="projectKey">
            <el-select
              v-model="surverReplyForm.projectKey"
              :placeholder="$t('survey.reply.belongPlaceholder')"
              clearable
              filterable
            >
              <el-option v-for="item in projectOption" :label="item.label" :value="item.value" :key="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('survey.reply.replyTitle')" prop="title">
            <el-input v-model="surverReplyForm.title" :placeholder="$t('survey.reply.replyTitlePlaceholder')" clearable />
          </el-form-item>
          <el-form-item :label="$t('survey.reply.image')">
            <UploadImg v-model:image-url="surverReplyForm.url" :file-size="5" width="100px" height="100px">
              <template #tip> {{ $t("main.uploadSizeErrorMsg", { size: "5M" }) }} </template>
            </UploadImg>
          </el-form-item>
          <el-form-item :label="$t('main.remark')">
            <el-input
              v-model="surverReplyForm.remark"
              type="textarea"
              :rows="5"
              :placeholder="$t('survey.reply.remarkPlaceholder')"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="resetForm(surveyReplyFormRef)">{{ $t("main.cancel") }}</el-button>
          <el-button type="primary" @click="submitForm(surveyReplyFormRef)"> {{ $t("main.confirm") }} </el-button>
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
import { useHandleData } from "@/hooks/useHandleData";
import { ElMessageBox } from "element-plus";
import { useDownload } from "@/hooks/useDownload";
const proTable = ref();
const fileUrl = import.meta.env.VITE_APP_BASE_FILE;
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const columns = reactive([
  { type: "selection", fixed: "left", width: 50 },
  // { type: "index", label: "序号", width: 80 },
  {
    prop: "projectName",
    label: "survey.reply.belong"
  },
  {
    prop: "title",
    label: "survey.reply.replyTitle",
    search: { el: "input", defaultValue: "" }
  },
  {
    prop: "url",
    label: "survey.reply.image",
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
    prop: "remark",
    label: "main.remark"
  },
  { prop: "operation", label: "main.operation", width: 170, fixed: "right" }
]);
const dataCallback = data => {
  return {
    list: data.rows,
    total: data.total
  };
};
const dialogShow = ref(false);
const dialogTitle = ref();
const surveyReplyFormRef = ref();
type SurveyPopForm = {
  projectKey: string;
  title: string;
  url: string;
  remark: string;
  id?: number;
  type: string;
};
const surverReplyForm = reactive<SurveyPopForm>({
  projectKey: "",
  title: "",
  url: "",
  remark: "",
  type: "新增"
});
const rules = reactive({
  title: [{ required: true, message: t("survey.reply.replyTitlePlaceholder"), trigger: "blur" }],
  projectKey: [
    {
      required: true,
      message: t("survey.reply.belongPlaceholder"),
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
    dialogTitle.value = t("main.add");
    delete surverReplyForm.id;
  } else {
    let { projectKey, title, replyDate, url, remark, id } = row;
    Object.assign(surverReplyForm, { projectKey, title, replyDate, url, remark, id });
    dialogTitle.value = t("main.edit");
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
  await useHandleData(deleteSurveyReply, ids, t("main.deleteBatchMsg"));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};
// 删除单条
const deleteSurveyReplyList = async params => {
  await useHandleData(deleteSurveyReply, params.id.toString(), t("main.deleteMsg", { title: params.title }));
  proTable.value?.getTableList();
};
const exportSurveyReply = async () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  ElMessageBox.confirm(t("main.exportMsg"), t("main.tips"), { type: "warning" }).then(() =>
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
