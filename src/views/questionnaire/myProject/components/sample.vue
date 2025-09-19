<template>
  <div class="sample main-box">
    <!-- 样本页面 -->
    <div class="table-box">
      <ProTable
        ref="proTable"
        :init-param="searchParams"
        :columns="columns"
        :request-api="getTableList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 4, xl: 4 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader>
          <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增样本</el-button>
          <el-button type="danger" :icon="Delete" @click="deleteDeptHandle" :disabled="isAllDelete">批量删除</el-button>
          <el-button type="success" :icon="Upload" @click="importFile">导入</el-button>
          <el-button type="warning" :icon="Download" @click="exportFile">导出</el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="warning" v-auth="['system:dept:edit']" link :icon="EditPen" @click="openDrawer('编辑', scope.row)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            v-auth="['system:dept:remove']"
            v-if="scope.row.deptId !== 100"
            link
            :icon="Delete"
            @click="deleteDeptHandle(scope.row)"
          >
            删除
          </el-button>
        </template>
      </ProTable>
      <ImportExcel ref="dialogRef" />
      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500" :before-close="handleClose">
        <el-form ref="ruleFormRef" :model="dialogForm" :rules="rules">
          <el-form-item label="工号" prop="employeeNo">
            <el-input v-model="dialogForm.employeeNo" placeholder="请输入工号" clearable />
          </el-form-item>
          <el-form-item label="姓名" prop="name">
            <el-input v-model="dialogForm.name" placeholder="请输入姓名" clearable />
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

<script setup lang="ts" name="sample">
import { ref, reactive, inject, computed } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { CirclePlus, Delete, EditPen, Upload, Download } from "@element-plus/icons-vue";
import {
  getSampleList,
  addSample,
  editSample,
  sampleDeatil,
  deleteSample,
  importSample
} from "@/api/modules/questionnaire/sample";
import { ElMessage, ElMessageBox } from "element-plus";
import ImportExcel from "./ImoportExcel.vue";
import { useHandleData } from "@/hooks/useHandleData";
import { useDownload } from "@/hooks/useDownload";
import { useRoute } from "vue-router";
const route = useRoute();
const key = route.query.key as string | undefined;

const proTable = ref();
const columns = reactive([
  { type: "selection", label: "", width: 80 },
  { prop: "employeeNo", label: "用户工号", search: { el: "input" } },
  { prop: "name", label: "用户姓名", search: { el: "input" } },
  { prop: "createTime", label: "创建时间" },
  { prop: "updateTime", label: "最后更新时间" },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);
interface dialogFormType {
  employeeNo: string;
  name: string;
  projectKey: string;
  id?: string;
}
const searchParams = reactive({
  // projectKey: "",
  // employeeNo: "",
  // name: "",
  // status: "",
  pageNum: 1,
  pageSize: 20
});

const getTableList = (params: any) => {
  params.projectKey = key;
  const newParams = JSON.parse(JSON.stringify(params)); // 深拷贝（可选）
  return getSampleList(newParams);
};

const dialogVisible = ref(false);
const dialogTitle = ref("");
const isAllDelete = computed(() => {
  return !proTable.value?.selectedListIds.length;
});
const dialogForm = reactive<dialogFormType>({
  employeeNo: "",
  name: "",
  projectKey: ""
});
const ruleFormRef = ref();
const rules = reactive({
  employeeNo: [{ required: true, message: "请输入工号" }],
  name: [{ required: true, message: "请输入姓名" }]
});
const dialogRef = ref(null);
const dataCallback = (data: any) => {
  proTable.value?.clearSelection();
  return {
    list: data.rows,
    total: data.total,
    current: data.current,
    size: data.size
  };
};
const projectKey = inject("projectKey");
// 打开 drawer(新增、查看、编辑)
const openDrawer = async (type, row = {}) => {
  dialogTitle.value = `${type}样本`;
  dialogVisible.value = true;
  dialogForm["projectKey"] = projectKey as string;
  if (row.id) {
    dialogForm["id"] = row.id;
    let res = await sampleDeatil(row.id);
    let data: any = res.data;
    dialogForm.name = data.name;
    dialogForm.employeeNo = data.employeeNo;
  }
};
const updatePage = () => {
  ruleFormRef.value.validate(async (valid, fields) => {
    if (valid) {
      let res: any = dialogForm.id ? await editSample(dialogForm) : await addSample(dialogForm);
      ElMessage.success(`${dialogForm.id ? "编辑样本" : "新增样本"}${res.msg}`);
      dialogVisible.value = false;
      dialogForm.name = "";
      dialogForm.employeeNo = "";
      delete dialogForm.id;
      proTable.value?.getTableList();
    } else {
      console.log("error submit!", fields);
    }
  });
};
// 取消弹窗
const handleClose = () => {
  dialogVisible.value = false;
  ruleFormRef.value.resetFields();
};
// 删除数据
const deleteDeptHandle = async _row => {
  let ids = [];
  let msg = "";
  if (_row.id) {
    ids = [_row.id];
    msg = `删除${_row.name}这条数据`;
  } else {
    ids = proTable.value?.selectedListIds;
    msg = `批量删除这${ids.length}条数据`;
  }
  await useHandleData(deleteSample, ids, msg);
  proTable.value?.getTableList();
};
// 导入数据
const importFile = () => {
  const params = {
    title: "用户",
    tempApi: "/survey/project/sample/template",
    importApi: importSample,
    getTableList: proTable.value?.getTableList,
    projectKey: key
  };
  dialogRef.value?.acceptParams(params);
};
// 导出文件
const exportFile = () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  let params = {
    ...proTable.value?.searchParam,
    projectKey: key
  };
  console.log(params, "params");
  ElMessageBox.confirm("确认导出样本数据?", "温馨提示", { type: "warning" }).then(() =>
    useDownload(`${baseUrl}/survey/project/sample/export`, "样本列表", true, ".xlsx", "post", params)
  );
};
</script>

<style scoped lang="scss">
.table-box {
  height: calc(100% - 24px);
  margin: 10px 12px;
}
</style>
