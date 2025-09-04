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
          <el-button type="primary" v-auth="['system:user:add']" :icon="CirclePlus" @click="addSurvey('新增')">
            新建问卷
          </el-button>
          <!-- <el-button type="primary" v-auth="['system:user:import']" :icon="Upload" plain @click="batchAdd">
            批量添加用户
          </el-button>
          <el-button type="warning" v-auth="['system:user:export']" :icon="Download" plain @click="downloadFile">
            导出用户数据
          </el-button> -->
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <!-- <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button> -->

          <el-tooltip placement="top" effect="dark" content="编辑">
            <el-button
              type="warning"
              link
              v-if="scope.row.userId !== 1"
              :icon="EditPen"
              v-auth="['system:user:edit']"
              @click="addSurvey('编辑', scope.row.projectKey)"
            >
            </el-button>
          </el-tooltip>
          <el-tooltip placement="top" effect="dark" content="答卷数据">
            <el-button
              type="success"
              link
              v-if="scope.row.userId !== 1"
              :icon="DataLine"
              v-auth="['system:user:edit']"
              @click="addSurvey('编辑', scope.row)"
            >
            </el-button>
          </el-tooltip>
          <el-tooltip placement="top" effect="dark" content="预览问卷">
            <el-button
              type="primary"
              link
              v-if="scope.row.userId !== 1"
              :icon="View"
              v-auth="['system:user:edit']"
              @click="addSurvey('编辑', scope.row)"
            >
            </el-button>
          </el-tooltip>
          <el-tooltip placement="top" effect="dark" content="答卷地址">
            <el-button
              type="info"
              class="btn-custom"
              link
              v-if="scope.row.userId !== 1"
              :icon="Share"
              v-auth="['system:user:edit']"
              @click="addSurvey('编辑', scope.row)"
            >
            </el-button>
          </el-tooltip>
          <el-tooltip placement="top" effect="dark" content="复制问卷">
            <el-button
              type="info"
              class="btn-copySurvey"
              link
              v-if="scope.row.userId !== 1"
              :icon="CopyDocument"
              v-auth="['system:user:edit']"
              @click="addSurvey('编辑', scope.row)"
            >
            </el-button>
          </el-tooltip>

          <el-tooltip placement="top" effect="dark" content="删除问卷">
            <el-button
              type="danger"
              link
              :icon="Delete"
              v-auth="['system:user:remove']"
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
    </div>
  </div>
</template>

<script setup lang="tsx" name="myProject">
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { getProjectList, deleteProject } from "@/api/modules/questionnaire/myProject";
import { surveyType } from "@/utils/questionnaire";
import { useHandleData } from "@/hooks/useHandleData";
import { useRouter } from "vue-router";
import {
  CirclePlus,
  Delete,
  EditPen,
  Share,
  DataLine,
  View,
  CopyDocument
  //  Download, Upload, View, Refresh, CircleCheck, DArrowRight
} from "@element-plus/icons-vue";
const router = useRouter();
const proTable = ref();
const columns = reactive([
  // const columns = reactive<ColumnProps<Account.ResAccountList>[]>([
  { type: "selection", label: "", width: 80 },
  { type: "index", label: "序号", width: 80 },
  { prop: "projectName", label: "问卷名称", search: { el: "input" }, align: "left" },
  { prop: "collectCount", label: "答卷数(份)", width: 180 },
  {
    width: 180,
    prop: "status",
    label: "问卷状态",
    tag: true,
    search: { el: "select" },
    enum: surveyType,
    render: scope => {
      let status = scope.row.status;
      let text = status == 1 ? "未发布" : status == 2 ? "收集中" : "停止发布";
      return <span>{<el-tag type={status === 1 ? "primary" : status === 2 ? "success" : "danger"}>{text}</el-tag>}</span>;
    }
  },
  { prop: "createTime", label: "创建时间", width: 200, sortable: true },
  { prop: "operation", label: "操作", fixed: "right" }
  //   { prop: "dept.deptName", label: "部门", width: 120 }
]);
const treeFilterValues = reactive({ pageNum: 1, pageSize: 20 });
const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total
  };
};
const addSurvey = (type: string, projectKey?: any) => {
  let path = "";
  if (type == "新增") {
  }
  path = "AddSurvery";
  router.push({
    path,
    query: projectKey
      ? { id: projectKey, type: "Edit" }
      : {
          type: "Add"
        }
  });
};
const deleteSurvey = async row => {
  // let msg = params.length > 1 ? "批量删除区域" : "删除该区域";
  await useHandleData(deleteProject, row.projectKey, "删除该区域");
  proTable.value?.getTableList();
};
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
</style>
