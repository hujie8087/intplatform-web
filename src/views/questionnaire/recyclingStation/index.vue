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
          <el-popconfirm class="box-item" title="确认恢复该问卷" placement="bottom" @confirm="recoverSurver(scope.row)">
            <template #reference>
              <el-button type="primary" link :icon="DataLine">恢复</el-button>
            </template>
          </el-popconfirm>
          <el-popconfirm
            class="box-item"
            title="确认删除该问卷吗?删除后将无法恢复"
            placement="bottom"
            @confirm="deleteSurvey(scope.row)"
          >
            <template #reference>
              <el-button type="danger" link :icon="Delete" v-auth="['system:user:edit']"> 删除 </el-button>
            </template>
          </el-popconfirm>
        </template>
      </ProTable>
    </div>
  </div>
</template>

<script setup lang="tsx" name="recyclingStation">
import { ref, reactive, onMounted } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { Delete, DataLine } from "@element-plus/icons-vue";
import { getProjectList, undeleteQuestionnaire, deleteProject } from "@/api/modules/questionnaire/recyclingStation";
import { RecyclingStation } from "@/api/interface/questionnaire/recyclingStation";
import { surveyType } from "@/utils/questionnaire";
import { ElMessage } from "element-plus";
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
  { type: "index", label: "序号", width: 80 },
  { prop: "projectName", label: "问卷名称", search: { el: "input" }, align: "left" },
  {
    prop: "createTime",
    label: "创建时间",
    align: "left"
  },
  {
    prop: "updateTime",
    label: "删除时间",
    align: "left"
  },
  {
    width: 180,
    prop: "status",
    label: "问卷状态",
    tag: true,
    enum: surveyType,
    render: scope => {
      let status = scope.row.status;
      let text = status == 1 ? "未发布" : status == 2 ? "收集中" : "停止发布";
      return <span>{<el-tag type={status === 1 ? "primary" : status === 2 ? "success" : "danger"}>{text}</el-tag>}</span>;
    }
  },
  { prop: "operation", label: "操作", fixed: "right" }
]);
const deleteSurvey = async row => {
  const res = await deleteProject(row.projectKey);
  if (res.code == 200) {
    ElMessage.success(`问卷删除${res.msg}`);
  }
  proTable.value?.getTableList();
};
// 恢复问卷
const recoverSurver = async row => {
  const res = await undeleteQuestionnaire(row.projectKey);
  if (res.code == 200) {
    ElMessage.success(`问卷恢复${res.msg}`);
  }
  proTable.value?.getTableList();
};
onMounted(async () => {
  // await getProjectList(treeFilterValues);
});
</script>

<style scoped></style>
