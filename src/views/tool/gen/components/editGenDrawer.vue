<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="1280">
    <el-tabs v-model="activeName">
      <el-tab-pane label="基本信息" name="basic">
        <el-form v-if="drawerProps.info" ref="basicInfoForm" :model="drawerProps.info" :rules="rules" label-width="150px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="表名称" prop="tableName">
                <el-input placeholder="请输入仓库名称" v-model="drawerProps.info.tableName" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="表描述" prop="tableComment">
                <el-input placeholder="请输入" v-model="drawerProps.info.tableComment" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="实体类名称" prop="className">
                <el-input placeholder="请输入" v-model="drawerProps.info.className" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="作者" prop="functionAuthor">
                <el-input placeholder="请输入" v-model="drawerProps.info.functionAuthor" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="备注" prop="remark">
                <el-input type="textarea" :rows="3" v-model="drawerProps.info.remark"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="字段信息" name="columnInfo">
        <el-table ref="dragTable" :data="drawerProps.rows" row-key="columnId" :max-height="tableHeight">
          <el-table-column label="序号" type="index" min-width="5%" />
          <el-table-column label="字段列名" prop="columnName" min-width="10%" :show-overflow-tooltip="true" />
          <el-table-column label="字段描述" min-width="10%">
            <template #default="scope">
              <el-input v-model="scope.row.columnComment"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="物理类型" prop="columnType" min-width="10%" :show-overflow-tooltip="true" />
          <el-table-column label="Java类型" min-width="11%">
            <template #default="scope">
              <el-select v-model="scope.row.javaType">
                <el-option label="Long" value="Long" />
                <el-option label="String" value="String" />
                <el-option label="Integer" value="Integer" />
                <el-option label="Double" value="Double" />
                <el-option label="BigDecimal" value="BigDecimal" />
                <el-option label="Date" value="Date" />
                <el-option label="Boolean" value="Boolean" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="java属性" min-width="10%">
            <template #default="scope">
              <el-input v-model="scope.row.javaField"></el-input>
            </template>
          </el-table-column>

          <el-table-column label="插入" min-width="5%">
            <template #default="scope">
              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isInsert"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="编辑" min-width="5%">
            <template #default="scope">
              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isEdit"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="列表" min-width="5%">
            <template #default="scope">
              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isList"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="查询" min-width="5%">
            <template #default="scope">
              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isQuery"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="查询方式" min-width="10%">
            <template #default="scope">
              <el-select v-model="scope.row.queryType">
                <el-option label="=" value="EQ" />
                <el-option label="!=" value="NE" />
                <el-option label=">" value="GT" />
                <el-option label=">=" value="GTE" />
                <el-option label="<" value="LT" />
                <el-option label="<=" value="LTE" />
                <el-option label="LIKE" value="LIKE" />
                <el-option label="BETWEEN" value="BETWEEN" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="必填" min-width="5%">
            <template #default="scope">
              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isRequired"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="显示类型" min-width="12%">
            <template #default="scope">
              <el-select v-model="scope.row.htmlType">
                <el-option label="文本框" value="input" />
                <el-option label="文本域" value="textarea" />
                <el-option label="下拉框" value="select" />
                <el-option label="单选框" value="radio" />
                <el-option label="复选框" value="checkbox" />
                <el-option label="日期控件" value="datetime" />
                <el-option label="图片上传" value="imageUpload" />
                <el-option label="文件上传" value="fileUpload" />
                <el-option label="富文本控件" value="editor" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="字典类型" min-width="12%">
            <template #default="scope">
              <el-select v-model="scope.row.dictType" clearable filterable placeholder="请选择">
                <el-option
                  v-for="dict in drawerProps.dictOptions"
                  :key="dict.dictType"
                  :label="dict.dictName"
                  :value="dict.dictType"
                >
                  <span style="float: left">{{ dict.dictName }}</span>
                  <span style="float: right; font-size: 13px; color: #8492a6">{{ dict.dictType }}</span>
                </el-option>
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="生成信息" name="genInfo" v-if="drawerProps.info">
        <!-- <gen-info-form ref="genInfo" :info="drawerProps.info" :tables="drawerProps.tables" /> -->
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" @click="handleSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="EditGenDrawer">
import { ref } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { Gen } from "@/api/interface/tool";
import { Dict } from "@/api/interface/system";
const { t } = useI18n(); // 解构出t方法

const tableHeight = ref(document.documentElement.scrollHeight - 245 + "px");

const activeName = ref("columnInfo");
interface DrawerProps {
  rowData?: Partial<Gen.ResGenList>;
  info?: Gen.ResGenList;
  rows?: Gen.DictDetail[];
  tables?: Gen.TablesDetail[];
  dictOptions?: Dict.ResDict[];
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
};
// 表单校验
const rules = ref({
  tableName: [{ required: true, message: "请输入表名称", trigger: "blur" }],
  tableComment: [{ required: true, message: "请输入表描述", trigger: "blur" }],
  className: [{ required: true, message: "请输入实体类名称", trigger: "blur" }],
  functionAuthor: [{ required: true, message: "请输入作者", trigger: "blur" }]
});

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!(drawerProps.value.rowData);
      ElMessage.success({
        message: t("main.successMsg", { title: "", method: "编辑" })
      });
      drawerProps.value.getTableList!();
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

defineExpose({
  acceptParams
});
</script>
