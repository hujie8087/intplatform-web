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
          <el-button type="primary" v-auth="['system:user:add']" :icon="CirclePlus" @click="editPorjectName">
            新建问卷
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <!-- <el-tooltip placement="top" effect="dark" content="编辑问卷名称">
            <el-button
              class="btn-edit-pen"
              link
              v-if="scope.row.userId !== 1"
              :icon="EditPen"
              v-auth="['system:user:edit']"
              @click="editPorjectName(scope.row)"
            >
            </el-button>
          </el-tooltip> -->
          <el-tooltip placement="top" effect="dark" content="编辑问卷">
            <el-button
              type="warning"
              link
              v-if="scope.row.userId !== 1"
              :icon="Edit"
              v-auth="['system:user:edit']"
              @click="rediectPage('questionBank', scope.row)"
            >
            </el-button
          ></el-tooltip>
          <el-tooltip placement="top" effect="dark" content="答卷数据">
            <el-button
              type="success"
              link
              v-if="scope.row.userId !== 1"
              :icon="DataLine"
              v-auth="['system:user:edit']"
              @click="rediectPage('stat', scope.row)"
            >
            </el-button>
          </el-tooltip>
          <el-tooltip placement="top" effect="dark" content="问卷设置">
            <el-button
              type="primary"
              link
              v-if="scope.row.userId !== 1"
              :icon="Setting"
              v-auth="['system:user:edit']"
              @click="rediectPage('setting', scope.row)"
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
              @click="rediectPage('publish', scope.row)"
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
              @click="copy(scope.row)"
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
      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500" :before-close="handleClose">
        <el-form ref="ruleFormRef" :model="dialogForm" :rules="rules" label-width="90">
          <el-form-item label="项目名称" prop="projectName">
            <el-input v-model="dialogForm.projectName" placeholder="请输入项目名称" clearable />
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
import { ref, reactive, h } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import {
  getProjectList,
  deleteProject,
  addProject,
  editProject,
  copyProject,
  getProjectDetail
} from "@/api/modules/questionnaire/myProject";
import { surveyType } from "@/utils/questionnaire";
import { useHandleData } from "@/hooks/useHandleData";
import { useRouter } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
import { CirclePlus, Delete, Share, DataLine, CopyDocument, Edit, Setting } from "@element-plus/icons-vue";
import { ElInput } from "element-plus";
const router = useRouter();
const proTable = ref();
const activeEditKey = ref(false);

const columns = reactive([
  { type: "selection", label: "", width: 80 },
  { type: "index", label: "序号", width: 80 },
  {
    prop: "projectName",
    label: "问卷名称",
    search: { el: "input" },
    align: "left",
    render: scope => {
      // const cacheName = scope.row.projectName;
      // 编辑状态：渲染输入框
      if (activeEditKey.value === scope.row.projectKey) {
        // 导入ElInput组件（确保已全局注册或在此处导入）
        // 输入事件处理函数
        const handleInput = async value => {
          // 更新行数据
          scope.row.projectName = value;
          dialogForm.projectKey = scope.row.projectKey;
          dialogForm.projectName = value;
          await editProject(dialogForm);
        };
        // 使用h函数创建ElInput组件
        return h(ElInput, {
          // 绑定值
          modelValue: scope.row.projectName || "",
          // 输入事件（v-model的更新事件）
          "onUpdate:modelValue": handleInput,
          // 输入框尺寸
          size: "large",
          disabled: scope.row.status === 1 ? false : true,
          // 占位符
          placeholder: "请输入问卷名称",
          // 样式
          style: { width: "100%", height: "100%" }
        });
      } else {
        return h(
          "p",
          {
            style: {
              width: "100%",
              height: "100%",
              cursor: scope.row.status === 1 ? "pointer" : "default",
              opacity: scope.row.status !== 1 ? 0.6 : 1
            },
            onClick: () => {
              if (scope.row.status !== 1) return;
              activeEditKey.value = scope.row.projectKey;
            }
          },
          scope.row.projectName || "未命名"
        );
      }
    }
  },
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
  { prop: "operation", label: "操作", width: 260, fixed: "right" }
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
const rules = reactive({ projectName: [{ required: true, message: "请输入项目名称", trigger: "blur" }] });
// 编辑问卷名称
const editPorjectName = async row => {
  if (row?.projectKey) {
    dialogTitle.value = "修改问卷";
    let res: any = await getProjectDetail(row?.projectKey);
    dialogForm.projectKey = res?.data?.projectKey;
    dialogForm.projectName = res?.data?.projectName;
  } else {
    dialogTitle.value = "新增问卷";
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
  ElMessageBox.confirm(`是否需要复制该问卷?`, "温馨提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
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
        rediectPage("questionBank", { projectKey: res.data });
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
  await useHandleData(deleteProject, row.projectKey, "删除该问卷");
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
.btn-edit-pen.is-link {
  color: #607d8b;
}
.btn-edit-pen.is-link:hover {
  color: #b1c6d1;
}
</style>
