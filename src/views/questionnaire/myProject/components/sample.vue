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
          <el-button type="primary" :icon="CirclePlus" v-auth="['survey:project:saveAll']" @click="openDrawer('新增')">{{
            $t("main.add")
          }}</el-button>
          <el-button
            type="danger"
            :icon="Delete"
            @click="deleteDeptHandle"
            v-auth="['survey:project:saveAll']"
            :disabled="isAllDelete"
            >{{ $t("main.batchDelete") }}</el-button
          >
          <el-button type="success" :icon="Upload" v-auth="['survey:project:saveAll']" @click="importFile">
            {{ $t("main.import") }}
          </el-button>
          <el-button type="warning" :icon="Download" v-auth="['survey:project:saveAll']" @click="exportFile">
            {{ $t("main.download") }}
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button
            type="warning"
            v-auth="['survey:project:saveAll']"
            link
            :icon="EditPen"
            @click="openDrawer('编辑', scope.row)"
            >{{ $t("main.edit") }}</el-button
          >
          <el-button
            type="danger"
            v-auth="['survey:project:saveAll']"
            v-if="scope.row.deptId !== 100"
            link
            :icon="Delete"
            @click="deleteDeptHandle(scope.row)"
          >
            {{ $t("main.delete") }}
          </el-button>
        </template>
      </ProTable>
      <ImportExcel ref="dialogRef" />
      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500" :before-close="handleClose">
        <el-form ref="ruleFormRef" :model="dialogForm" :rules="rules">
          <el-form-item :label="$t('survey.sample.employeeNo')" prop="employeeNo">
            <el-input v-model="dialogForm.employeeNo" :placeholder="$t('main.inputPlaceholder')" clearable />
          </el-form-item>
          <el-form-item :label="$t('survey.sample.name')" prop="name">
            <el-input v-model="dialogForm.name" :placeholder="$t('main.inputPlaceholder')" clearable />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="handleClose">{{ $t("main.cancel") }}</el-button>
            <el-button type="primary" @click="updatePage">{{ $t("main.confirm") }}</el-button>
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
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const route = useRoute();
const key = route.query.key as string | undefined;
const proTable = ref();
const columns = reactive([
  { type: "selection", label: "", width: 80 },
  {
    prop: "employeeNo",
    label: "survey.sample.employeeNo",
    search: { el: "input", props: { placeholder: t("main.inputPlaceholder") } }
  },
  { prop: "name", label: "survey.sample.name", search: { el: "input", props: { placeholder: t("main.inputPlaceholder") } } },
  { prop: "createTime", label: "main.createTime" },
  { prop: "updateTime", label: "main.updateTime" },
  { prop: "operation", label: "main.operation", width: 230, fixed: "right" }
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
  employeeNo: [{ required: true, message: t("main.inputError", { msg: t("survey.sample.employeeNo") }) }],
  name: [{ required: true, message: t("main.inputError", { msg: t("survey.sample.name") }) }]
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
  ElMessageBox.confirm(t("main.exportMsg"), t("main.tips"), { type: "warning" }).then(() =>
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
