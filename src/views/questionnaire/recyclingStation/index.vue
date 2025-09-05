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
        <!-- <template #tableHeader> -->
        <!-- <el-button type="primary" v-auth="['system:user:add']" :icon="CirclePlus" @click="addSurvey('新增')">
              新建问卷
            </el-button> -->
        <!-- <el-button type="primary" v-auth="['system:user:import']" :icon="Upload" plain @click="batchAdd">
                批量添加用户
              </el-button>
              <el-button type="warning" v-auth="['system:user:export']" :icon="Download" plain @click="downloadFile">
                导出用户数据
              </el-button> -->
        <!-- </template> -->
        <!-- 表格操作 -->
        <!-- <template #operation="scope"> -->
        <!-- <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button> -->

        <!-- <el-tooltip placement="top" effect="dark" content="编辑">
              <el-button
                type="warning"
                link
                v-if="scope.row.userId !== 1"
                :icon="EditPen"
                v-auth="['system:user:edit']"
                @click="addSurvey('编辑', scope.row.projectKey)"
              >
              </el-button>
            </el-tooltip> -->
        <!-- <el-tooltip placement="top" effect="dark" content="答卷数据">
              <el-button
                type="success"
                link
                v-if="scope.row.userId !== 1"
                :icon="DataLine"
                v-auth="['system:user:edit']"
                @click="addSurvey('编辑', scope.row)"
              >
              </el-button>
            </el-tooltip> -->
        <!-- <el-tooltip placement="top" effect="dark" content="预览问卷">
              <el-button
                type="primary"
                link
                v-if="scope.row.userId !== 1"
                :icon="View"
                v-auth="['system:user:edit']"
                @click="addSurvey('编辑', scope.row)"
              >
              </el-button>
            </el-tooltip> -->
        <!-- <el-tooltip placement="top" effect="dark" content="答卷地址">
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
            </el-tooltip> -->
        <!-- <el-tooltip placement="top" effect="dark" content="复制问卷">
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
            </el-tooltip> -->

        <!-- <el-tooltip placement="top" effect="dark" content="删除问卷">
              <el-button
                type="danger"
                link
                :icon="Delete"
                v-auth="['system:user:remove']"
                @click="deleteSurvey(scope.row)"
              ></el-button>
            </el-tooltip> -->
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
        <!-- </template> -->
      </ProTable>
    </div>
  </div>
</template>

<script setup lang="tsx" name="recyclingStation">
import { ref, reactive, onMounted } from "vue";
// deleteProject, undeleteQuestionnaire
import ProTable from "@/components/ProTable/index.vue";
import { getProjectList } from "@/api/modules/questionnaire/recyclingStation";
import { RecyclingStation } from "@/api/interface/questionnaire/recyclingStation";
import { surveyType } from "@/utils/questionnaire";
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
    search: {
      el: "date-picker",
      props: { type: "datetime", valueFormat: "YYYY-MM-DD HH:mm:ss" }
    },
    align: "left"
  },
  {
    prop: "endQueryTime",
    label: "删除时间",
    search: { el: "date-picker", props: { type: "datetime", valueFormat: "YYYY-MM-DD HH:mm:ss" } },
    align: "left"
  },
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
  }
]);
onMounted(async () => {
  // await getProjectList(treeFilterValues);
});
</script>

<style scoped></style>
