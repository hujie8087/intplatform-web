<template>
  <div class="recycling-station main-box">
    <!-- 问卷-回收站页面 -->
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
        <!-- <template #tableHeader>
        <el-button type="primary" v-auth="['system:user:add']" :icon="CirclePlus" @click="addSurvey('新增')">
              新建问卷
            </el-button>
       </template> -->
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button
            type="primary"
            v-auth="['survey:project:recycle:restore']"
            @click="recoverSurver(scope.row)"
            link
            :icon="Refresh"
            >{{ $t("survey.recycle.restore") }}</el-button
          >
          <el-button type="danger" @click="deleteSurvey(scope.row)" link :icon="Delete" v-auth="['survey:project:recycle:del']">
            {{ $t("main.delete") }}
          </el-button>
        </template>
      </ProTable>
    </div>
  </div>
</template>

<script setup lang="tsx" name="recyclingStation">
import { ref, reactive, onMounted } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { Delete, Refresh } from "@element-plus/icons-vue";
import { getProjectList, undeleteQuestionnaire, deleteProject } from "@/api/modules/questionnaire/recyclingStation";
import { RecyclingStation } from "@/api/interface/questionnaire/recyclingStation";
import { surveyType } from "@/utils/questionnaire";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const proTable = ref();

const treeFilterValues = reactive({
  pageNum: 1,
  pageSize: 20
});
const dataCallback = (data: RecyclingStation.ProjectList) => {
  return {
    list: data.rows,
    total: data.total
  };
};
const columns = reactive([
  { type: "selection", label: "", width: 80 },
  { prop: "projectName", label: "survey.recycle.questionnaireName", search: { el: "input" }, align: "left" },
  {
    prop: "createTime",
    label: "main.createTime",
    align: "left"
  },
  {
    prop: "updateTime",
    label: "survey.recycle.deleteTime",
    align: "left"
  },
  {
    width: 180,
    prop: "status",
    label: "survey.recycle.status",
    tag: true,
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
  { prop: "operation", label: "main.operation", fixed: "right" }
]);
const deleteSurvey = async row => {
  ElMessageBox.confirm(t("survey.recycle.deleteTip"), t("main.tips"), {
    confirmButtonText: t("main.confirm"),
    cancelButtonText: t("main.cancel"),
    type: "warning",
    draggable: true
  })
    .then(async () => {
      const res = await deleteProject(row.projectKey);
      if (res.code == 200) {
        ElMessage.success(`问卷删除${res.msg}`);
      }
      proTable.value?.getTableList();
    })
    .catch(() => {
      // cancel operation
    });
};
// 恢复问卷
const recoverSurver = async row => {
  ElMessageBox.confirm(t("survey.recycle.restoreTip"), t("main.tips"), {
    confirmButtonText: t("main.confirm"),
    cancelButtonText: t("main.cancel"),
    type: "warning",
    draggable: true
  })
    .then(async () => {
      const res = await undeleteQuestionnaire(row.projectKey);
      if (res.code == 200) {
        ElMessage.success(`问卷恢复${res.msg}`);
      }
      proTable.value?.getTableList();
    })
    .catch(() => {
      // cancel operation
    });
};

onMounted(async () => {
  // await getProjectList(treeFilterValues);
});
</script>

<style scoped></style>
