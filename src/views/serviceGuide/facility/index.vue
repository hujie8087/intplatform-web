<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getGuideList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" v-auth="['other:article:add']" @click="openDrawer('新增')"
            >新增配套设施</el-button
          >
          <el-button
            type="danger"
            :disabled="!scope.isSelected"
            v-auth="['other:article:remove']"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除配套设施
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="warning" link :icon="Edit" v-auth="['other:article:edit']" @click="openDrawer('编辑', scope.row)"
            >编辑</el-button
          >
          <el-button type="danger" link :icon="Delete" v-auth="['other:article:remove']" @click="deleteGuideHandle(scope.row)"
            >删除</el-button
          >
        </template>
      </ProTable>
      <FacilityDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="Facility">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import FacilityDrawer from "./components/FacilityDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, Edit, View } from "@element-plus/icons-vue";
import { getGuideList, deleteGuide, editGuide, addGuide, getGuideById } from "@/api/modules/serviceGuide/guide";
import { Guide } from "@/api/interface/serviceGuide";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import { ElMessage } from "element-plus";
import { useDict } from "@/hooks/useDict";
import { useAuthButtons } from "@/hooks/useAuthButtons";
const { t } = useI18n(); // 解构出t方法
const { BUTTONS } = useAuthButtons();
// 字典数据
const sys_normal_disable = ref<DictOptions[]>([]);
const facilityTypeOptions = ref<DictOptions[]>([]);
useDict("sys_normal_disable", "facility_type_options").then(res => {
  sys_normal_disable.value = res.sys_normal_disable;
  facilityTypeOptions.value = res.facility_type_options.map(item => ({
    ...item,
    value: +item.value
  }));
});

// ProTable 实例
const proTable = ref<ProTableInstance>();
const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total,
    current: data.current,
    size: data.size
  };
};

// 表格配置项
const columns = reactive<ColumnProps<Guide.ResGuide>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "id", label: "序号", width: 80 },
  { prop: "title", label: "名称", search: { el: "input", tooltip: "请输入名称" } },
  {
    prop: "typeId",
    label: "类型",
    enum: facilityTypeOptions,
    tag: true,
    search: { el: "select", props: { filterable: true } }
  },
  { prop: "file", label: "地址", search: { el: "input", tooltip: "请输入地址" } },
  {
    prop: "sort",
    label: "排序",
    width: 120,
    render(scope) {
      return (
        <span>
          {BUTTONS.value["*:*:*"] || BUTTONS.value["other:article:edit"] ? (
            <el-input-number
              v-model={scope.row.sort}
              controls-position="right"
              style="width: 100px"
              onChange={() => setSort(scope.row)}
            />
          ) : (
            <el-tag type={scope.row.status ? "success" : "danger"}>{scope.row.status ? "启用" : "禁用"}</el-tag>
          )}
        </span>
      );
    }
  },
  {
    prop: "status",
    label: "状态",
    enum: sys_normal_disable,
    tag: true,
    search: { el: "select", props: { filterable: true } },
    width: 100,
    render(scope) {
      return (
        <div>
          {BUTTONS.value["*:*:*"] || BUTTONS.value["other:article:edit"] ? (
            <el-switch
              model-value={scope.row.status}
              active-text={scope.row.status === "0" ? "启用" : "禁用"}
              active-value={"0"}
              inactive-value={"1"}
              onClick={() => changeStatus(scope.row)}
            />
          ) : (
            <el-tag type={scope.row.status === "0" ? "success" : "danger"}>{scope.row.status === "0" ? "启用" : "禁用"}</el-tag>
          )}
        </div>
      );
    }
  },
  { prop: "operation", label: "操作", width: 260, fixed: "right" }
]);

// 删除配套设施
const deleteGuideHandle = async (params: Guide.ResGuide) => {
  await useHandleData(deleteGuide, params.id, `删除配套设施`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteGuide, ids, t("main.deleteBatchMsg", { title: "配套设施" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof FacilityDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Guide.ResGuide> = {}) => {
  if (row.id) {
    const res = await getGuideById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addGuide : title === "编辑" ? editGuide : undefined,
    getTableList: proTable.value?.getTableList,
    guideTypeOptions: facilityTypeOptions.value
  };
  drawerRef.value?.acceptParams(params);
};
const setSort = async (row: Guide.ResGuide) => {
  try {
    await editGuide({ ...row, nextApprovalFlag: 0 });
    proTable.value?.getTableList();
  } catch (error) {
    ElMessage.error("设置排序失败");
  }
};

// 切换状态
const changeStatus = async (row: Partial<Guide.ResGuide>) => {
  await useHandleData(
    editGuide,
    { ...row, nextApprovalFlag: 0, status: row.status === "1" ? "0" : "1" },
    `切换【${row.title}】配套设施状态`
  );
  proTable.value?.getTableList();
};
</script>
