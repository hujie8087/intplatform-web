<template>
  <div class="table-box">
    <ProTable ref="proTable" :columns="columns" :request-api="getTableList" :data-callback="dataCallback" row-key="dictCode">
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增字典数据</el-button>
        <el-button type="primary" :icon="Download" plain @click="downloadFile">导出字典数据</el-button>
        <el-button type="danger" :icon="Delete" plain :disabled="!scope.isSelected" @click="batchDelete(scope.selectedListIds)">
          批量删除字典数据
        </el-button>
      </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <el-button type="warning" link :icon="EditPen" @click="openDrawer('编辑', scope.row)">编辑</el-button>
        <el-button type="danger" link :icon="Delete" @click="deleteAccount(scope.row)">删除</el-button>
      </template>
    </ProTable>
    <DictDataDrawer ref="drawerRef" />
  </div>
</template>

<script setup lang="tsx" name="useProTable">
import { ref, reactive } from "vue";
import { useRoute } from "vue-router";
import { Dict } from "@/api/interface/system";
import { useHandleData } from "@/hooks/useHandleData";
import { useDownload } from "@/hooks/useDownload";
import { ElMessageBox } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import DictDataDrawer from "./components/DictDataDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, Download } from "@element-plus/icons-vue";
import { DictOptions } from "@/api/interface/index";
import {
  addDictData,
  deleteDictData,
  editDictData,
  getDictDataById,
  getDictDataList,
  getDictSelect
} from "@/api/modules/system/dict";
import { userStatus } from "@/utils/serviceDict";

const baseUrl = import.meta.env.VITE_API_URL;
const route = useRoute();

// ProTable 实例
const proTable = ref<ProTableInstance>();
const dictType = ref(route.query.dictType as string);
// 如果表格需要初始化请求参数，直接定义传给 ProTable (之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)

// dataCallback 是对于返回的表格数据做处理，如果你后台返回的数据不是 list && total && pageNum && pageSize 这些字段，可以在这里进行处理成这些字段
// 或者直接去 hooks/useTable.ts 文件中把字段改为你后端对应的就行
const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total
  };
};

// 如果你想在请求之前对当前请求参数做一些操作，可以自定义如下函数：params 为当前所有的请求参数（包括分页），最后返回请求列表接口
// 默认不做操作就直接在 ProTable 组件上绑定	:requestApi="getUserList"
const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  dictType.value = newParams.dictType;
  console.log(newParams, dictType.value);

  return getDictDataList(newParams);
};
// 查询字典选择框列表
const dictOptions = ref<DictOptions[]>([]);
const getDictSelectList = async () => {
  const { data } = await getDictSelect();
  dictOptions.value = data.map(item => {
    return { label: item.dictName, value: item.dictType };
  });
};
getDictSelectList();
// 表格配置项
const columns = reactive<ColumnProps<Dict.ResDictData>[]>([
  { type: "selection", fixed: "left", width: 50 },
  {
    prop: "dictType",
    label: "字典名称",
    width: 80,
    enum: dictOptions,
    search: { el: "select", defaultValue: dictType.value },
    isShow: false,
    align: "center"
  },
  { prop: "dictCode", label: "字典编码", width: 80 },
  { prop: "dictLabel", label: "字典标签", search: { el: "input" }, align: "center" },
  {
    prop: "dictValue",
    label: "字典键值"
  },
  {
    prop: "dictSort",
    label: "排序"
  },
  {
    prop: "status",
    label: "状态",
    width: 120,
    sortable: true,
    tag: true,
    enum: userStatus,
    search: { el: "select" }
  },
  { prop: "remark", label: "备注", width: 180 },
  {
    prop: "createTime",
    label: "创建时间",
    width: 180
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除字典数据信息
const deleteAccount = async (params: Dict.ResDictData) => {
  await useHandleData(deleteDictData, params.dictCode, `删除【${params.dictLabel}】字典数据`);
  proTable.value?.getTableList();
};

// 批量删除字典数据信息
const batchDelete = async (id: number[]) => {
  await useHandleData(deleteDictData, id.join(","), "删除所选字典数据信息");
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 导出字典数据列表
const downloadFile = async () => {
  ElMessageBox.confirm("确认导出字典数据数据?", "温馨提示", { type: "warning" }).then(() =>
    useDownload(`${baseUrl}/system/dict/data/export`, "字典数据列表", true, ".xlsx", "get", proTable.value?.searchParam)
  );
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof DictDataDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Dict.ResDictData> = {}) => {
  if (row.dictCode) {
    const res = await getDictDataById(row.dictCode);
    row = res.data;
  } else {
    row.dictType = dictType.value;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addDictData : title === "编辑" ? editDictData : undefined,
    getTableList: proTable.value?.getTableList
  };
  drawerRef.value?.acceptParams(params);
};
</script>
