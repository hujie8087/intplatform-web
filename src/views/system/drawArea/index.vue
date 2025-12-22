<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getRegionList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增</el-button>
          <el-button
            type="danger"
            :disabled="!scope.isSelected"
            v-auth="['delivery:staff:remove']"
            :icon="Delete"
            @click="deleteDeliveryStaffHandle(scope.selectedListIds)"
          >
            批量删除
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="Edit" @click="openDrawer('编辑', scope.row)">编辑</el-button>
          <el-button
            type="danger"
            link
            v-auth="['delivery:staff:remove']"
            :icon="Delete"
            @click="deleteDeliveryStaffHandle([scope.row.id])"
          >
            删除
          </el-button>
        </template>
      </ProTable>
      <DrawAreaForm ref="drawAreaFormRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="DrawArea">
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import DrawAreaForm from "./components/DrawAreaForm.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Delete, Edit, CirclePlus } from "@element-plus/icons-vue";
import { getRegionList, deleteRegion } from "@/api/modules/system/drawArea";
// import { useI18n } from "vue-i18n";
import { useHandleData } from "@/hooks/useHandleData";
import { Area } from "@/api/interface/system";

// const { t } = useI18n(); // 解构出t方法
let treeData = [];

// 字典数据
// const staffStatusOptions = ref<DictOptions[]>([
//   { label: "空闲", value: "0", tagType: "success" },
//   { label: "禁用", value: "1", tagType: "danger" },
//   { label: "忙碌", value: "3", tagType: "warning" }
// ]);

// const tagTypeOptions = ref<string[]>(["success", "danger", "warning", "info", "primary", "error"]);

// ProTable 实例
const proTable = ref<ProTableInstance>();
const dataCallback = (data: any) => {
  let { total, rows } = data;
  treeData = rows;
  return {
    list: rows,
    total: total
    // current: data.current || 1,
    // size: data.size || 50
  };
};

// 表格配置项
const columns = reactive<ColumnProps<Area.ResArea>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 80 },
  { label: "区域名称", prop: "areaName", search: { el: "input" } },
  { prop: "buildName", label: "生活区区域" },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除反馈
const deleteDeliveryStaffHandle = async (params: any) => {
  let str = params.join(",");
  let msg = params.length > 1 ? "批量删除区域" : "删除该区域";
  await useHandleData(deleteRegion, str, msg);
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawAreaFormRef = ref<InstanceType<typeof DrawAreaForm> | null>(null);
const openDrawer = async (title: string, row?: Partial<Area.ResArea>) => {
  const params = {
    title,
    rowData: { ...row },
    treeData,
    getTableList: proTable.value?.getTableList
  };
  drawAreaFormRef.value?.acceptParams(params);
};
</script>
