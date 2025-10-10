<template>
  <div class="my-project main-box">
    <!-- 问卷-我的项目-主页 -->
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getProjectList"
        :init-param="treeFilterValues"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader>
          <el-button type="primary" v-auth="['survey:project:add']" :icon="CirclePlus" @click="editPorjectName">
            {{ $t("main.add") }}
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-tooltip placement="top" effect="dark" :content="$t('main.edit')">
            <el-button
              type="warning"
              link
              v-if="scope.row.userId !== 1"
              :icon="Edit"
              v-auth="['survey:project:saveAll']"
              @click="rediectPage('questionBank', scope.row)"
            >
            </el-button
          ></el-tooltip>
          <el-tooltip placement="top" effect="dark" :content="$t('survey.project.stat')">
            <el-button
              type="success"
              link
              v-if="scope.row.userId !== 1"
              :icon="DataLine"
              v-auth="['survey:project:saveAll']"
              @click="rediectPage('stat', scope.row)"
            >
            </el-button>
          </el-tooltip>
          <el-tooltip placement="top" effect="dark" :content="$t('survey.project.setting')">
            <el-button
              type="primary"
              link
              v-if="scope.row.userId !== 1"
              :icon="Setting"
              v-auth="['survey:project:saveAll']"
              @click="rediectPage('setting', scope.row)"
            >
            </el-button>
          </el-tooltip>
          <el-tooltip placement="top" effect="dark" :content="$t('survey.project.share')">
            <el-button
              type="info"
              class="btn-custom"
              link
              v-if="scope.row.userId !== 1"
              :icon="Share"
              v-auth="['survey:project:saveAll']"
              @click="rediectPage('publish', scope.row)"
            >
            </el-button>
          </el-tooltip>

          <el-tooltip
            placement="top"
            effect="dark"
            :content="
              scope.row.status === 1 ? $t('survey.project.begin') : scope.row.status === 2 ? $t('survey.project.stop') : ''
            "
          >
            <el-button
              v-if="scope.row.status === 1"
              type="info"
              class="btn-custom"
              link
              :icon="VideoPlay"
              v-auth="['survey:project:saveAll']"
              @click="updateStatus(scope.row)"
            >
            </el-button>
            <el-button
              v-if="scope.row.status === 2"
              type="warning"
              link
              :icon="VideoPause"
              v-auth="['survey:project:saveAll']"
              @click="updateStatus(scope.row)"
            >
            </el-button>
          </el-tooltip>

          <el-tooltip placement="top" effect="dark" :content="$t('survey.project.copy')">
            <el-button
              type="info"
              class="btn-copySurvey"
              link
              v-if="scope.row.userId !== 1"
              :icon="CopyDocument"
              v-auth="['survey:project:copy']"
              @click="copy(scope.row)"
            >
            </el-button>
          </el-tooltip>

          <el-tooltip placement="top" effect="dark" :content="$t('main.delete')">
            <el-button
              type="danger"
              link
              :icon="Delete"
              v-auth="['survey:project:remove']"
              @click="deleteSurvey(scope.row)"
            ></el-button>
          </el-tooltip>
          <!-- <el-dropdown v-if="scope.row.userId !== 1" style="display: inline-block; margin-left: 10px; vertical-align: middle">
            <el-button type="success" link :icon="DArrowRight">更多</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-button type="primary" link :icon="Refresh" v-auth="['system:user:resetPwd']" @click="resetPass(scope.row)"
                    >重置密码</el-button
                  >
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button
                    type="primary"
                    link
                    :icon="CircleCheck"
                    v-auth="['system:user:edit']"
                    @click="handleAuthRole(scope.row)"
                    >分配角色</el-button
                  >
                </el-dropdown-item>
                <el-dropdown-item>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown> -->
        </template>
      </ProTable>
      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500" :before-close="handleClose">
        <el-form ref="ruleFormRef" :model="dialogForm" :rules="rules" label-width="90">
          <el-form-item :label="$t('survey.project.questionnaireName')" prop="projectName">
            <el-input
              maxlength="40"
              show-word-limit
              v-model="dialogForm.projectName"
              :placeholder="$t('survey.project.questionnaireNamePlaceholder')"
              clearable
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="handleClose">取消</el-button>
            <el-button type="primary" @click="updatePage">确定</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="tsx" name="myProject">
import { ref, reactive, onMounted, watch } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import {
  getProjectList,
  deleteProject,
  addProject,
  editProject,
  copyProject,
  getProjectDetail,
  publishProject,
  stopProject
} from "@/api/modules/questionnaire/myProject";
import { useHandleData } from "@/hooks/useHandleData";
import { useRouter } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
import {
  CirclePlus,
  Delete,
  Share,
  DataLine,
  CopyDocument,
  Edit,
  Setting,
  VideoPlay,
  VideoPause,
  EditPen
} from "@element-plus/icons-vue";
import { ElInput } from "element-plus";
const router = useRouter();
const proTable = ref();
import { useI18n } from "vue-i18n";
const { t, locale } = useI18n();

interface SurveyTypeItem {
  label: string;
  value: number;
}
const surveyType = ref<SurveyTypeItem[]>([]);

const columns = reactive([
  { type: "selection", label: "", width: 80 },
  {
    prop: "projectName",
    label: "survey.project.questionnaireName",
    search: { el: "input" },
    align: "left",
    render: scope => {
      const { status, projectName } = scope.row;
      return (
        <span>
          {projectName}
          {status === 1 && (
            <el-icon onClick={() => editPorjectName(scope.row)} style="margin-left: 8px; cursor: pointer; color: #409EFF;">
              <EditPen />
            </el-icon>
          )}
        </span>
      );
    }
  },
  { prop: "collectCount", label: "survey.project.collectionQuantity", width: 180 },
  {
    width: 180,
    prop: "status",
    label: "survey.project.status",
    tag: true,
    search: { el: "select" },
    enum: surveyType,
    render: scope => {
      let status = scope.row.status;
      let text =
        status == 1
          ? t("survey.statusOptions.unpublished")
          : status == 2
            ? t("survey.statusOptions.inCollection")
            : t("survey.statusOptions.stopped");
      return <span>{<el-tag type={status === 1 ? "primary" : status === 2 ? "success" : "danger"}>{text}</el-tag>}</span>;
    }
  },
  { prop: "createTime", label: "main.createTime", width: 200, sortable: true },
  { prop: "operation", label: "main.operation", width: 260, fixed: "right" }
  //   { prop: "dept.deptName", label: "部门", width: 120 }
]);
const treeFilterValues = reactive({ pageNum: 1, pageSize: 20 });
const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total
  };
};
const dialogTitle = ref("新增问卷");
const dialogVisible = ref(false);
const ruleFormRef = ref();
// 弹窗
interface dialogFormType {
  projectName: string;
  projectKey?: string;
  status?: any;
}
const dialogForm = reactive<dialogFormType>({
  projectName: "",
  status: null
});
const rules = reactive({
  projectName: [{ required: true, message: t("survey.project.questionnaireNamePlaceholder"), trigger: "blur" }]
});
// 编辑问卷名称
const editPorjectName = async row => {
  if (row?.projectKey) {
    dialogTitle.value = t("main.edit");
    let res: any = await getProjectDetail(row?.projectKey);
    dialogForm.projectKey = res?.data?.projectKey;
    dialogForm.projectName = res?.data?.projectName;
  } else {
    dialogTitle.value = t("main.add");
  }
  dialogVisible.value = true;
};

// 跳转页面
const rediectPage = (current, data: any) => {
  let projectKey = data.projectKey;
  let projectName = data.projectName;
  let path = "AddSurvery";
  router.push({
    path,
    query: { key: projectKey, projectName: projectName, current: current }
  });
};

// 复制问卷
const copy = async (data: any) => {
  const { projectKey } = data;
  ElMessageBox.confirm(t("survey.project.copyTip"), t("main.tips"), {
    confirmButtonText: t("main.confirm"),
    cancelButtonText: t("main.cancel"),
    type: "warning",
    draggable: true
  })
    .then(async () => {
      await copyProject(projectKey);
      proTable.value?.getTableList();
    })
    .catch(() => {
      // cancel operation
    });
};

// 取消弹窗
const handleClose = () => {
  dialogVisible.value = false;
  ruleFormRef.value.resetFields();
};
// 弹窗确认
const updatePage = () => {
  ruleFormRef.value.validate(async (valid, fields) => {
    if (valid) {
      let res: any = {};
      if (dialogForm.projectKey) {
        res = await editProject(dialogForm);
        ElMessage.success(`修改问卷${res.msg}`);
      } else {
        res = await addProject(dialogForm);
        ElMessage.success(`新增问卷${res.msg}`);
        rediectPage("questionBank", { projectKey: res.data, projectName: dialogForm.projectName });
      }
      dialogForm.projectName = "";
      delete dialogForm.projectKey;
      proTable.value?.getTableList();
      dialogVisible.value = false;
    } else {
      console.log("error submit!", fields);
    }
  });
};
const deleteSurvey = async row => {
  // let msg = params.length > 1 ? "批量删除区域" : "删除该区域";
  await useHandleData(deleteProject, row.projectKey, t("main.deleteMsg"));
  proTable.value?.getTableList();
};

// 更新状态
const updateStatus = async row => {
  let msg = row.status === 1 ? t("survey.project.publishTip") : row.status === 2 ? t("survey.project.stopTip") : "";
  ElMessageBox.confirm(msg, t("main.tips"), {
    confirmButtonText: t("main.confirm"),
    cancelButtonText: t("main.cancel"),
    type: "warning",
    draggable: true
  })
    .then(async () => {
      // 刷新列表
      let res: any = row.status === 1 ? await publishProject(row.projectKey) : await stopProject(row.projectKey);
      if (res?.code == 200) {
        ElMessage.success(row.status === 1 ? t("survey.project.publishTipSuccess") : t("survey.project.stopTipSuccess"));
      }
      proTable.value?.getTableList();
    })
    .catch(() => {
      // cancel operation
    });
};

const generateSurveyType = () => {
  return [
    { label: t("survey.statusOptions.unpublished"), value: 1 },
    { label: t("survey.statusOptions.inCollection"), value: 2 },
    { label: t("survey.statusOptions.stopped"), value: 3 }
  ];
};

// 监听语言变化，重新生成数组
watch(
  () => locale.value, // 监听语言切换
  () => {
    surveyType.value = generateSurveyType();
  }
);

onMounted(() => {
  surveyType.value = generateSurveyType();
});
</script>

<style scoped>
.btn-custom.is-link {
  color: #5070dd; /* 你要的第六种颜色 */
}
.btn-custom.is-link:hover {
  color: #9caef1; /* hover 效果 */
}
.btn-copySurvey.is-link {
  color: #785db0; /* 你要的第六种颜色 */
}
.btn-copySurvey.is-link:hover {
  color: #cfc0ed; /* hover 效果 */
}
.btn-edit-pen.is-link {
  color: #607d8b;
}
.btn-edit-pen.is-link:hover {
  color: #b1c6d1;
}
</style>
