<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getAppResourceList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" v-auth="['other:appResource:add']" @click="openDrawer('新增')"
            >新增</el-button
          >
          <el-button
            type="danger"
            :disabled="!scope.isSelected"
            v-auth="['other:appResource:remove']"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" v-auth="['other:appResource:query']" @click="openDrawer('查看', scope.row)"
            >查看</el-button
          >
          <el-button type="warning" link :icon="Edit" v-auth="['other:appResource:edit']" @click="openDrawer('编辑', scope.row)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            link
            :icon="Delete"
            v-auth="['other:appResource:remove']"
            @click="deleteAppResourceHandle(scope.row)"
            >删除</el-button
          >
        </template>
      </ProTable>
      <AppResourceDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="AppResource">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import AppResourceDrawer from "./components/AppResourceDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, Edit, View } from "@element-plus/icons-vue";
import {
  getAppResourceList,
  deleteAppResource,
  editAppResource,
  addAppResource,
  getAppResourceById
} from "@/api/modules/system/appResource";
import { AppResource } from "@/api/interface/system";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import { ElMessage } from "element-plus";
import { useDict } from "@/hooks/useDict";
import { useAuthButtons } from "@/hooks/useAuthButtons";
const { t } = useI18n(); // 解构出t方法
const { BUTTONS } = useAuthButtons();
// 字典数据
const sys_normal_disable = ref<DictOptions[]>([]);
const resourceTypeOptions = ref<DictOptions[]>([]);
useDict("sys_normal_disable", "app_resource_type").then(res => {
  sys_normal_disable.value = res.sys_normal_disable;
  resourceTypeOptions.value = res.app_resource_type;
});

// 内容类型IMAGE-图片，TEXT-文本，LINK-链接，JSON-复杂结构
const contentTypeOptions = ref<DictOptions[]>([
  { label: "文本", value: "TEXT", tagType: "primary" },
  { label: "富文本", value: "RICH_TEXT", tagType: "success" },
  { label: "图片", value: "IMAGE", tagType: "success" },
  { label: "链接", value: "LINK", tagType: "warning" },
  { label: "复杂结构", value: "JSON", tagType: "danger" }
]);
const platformOptions = ref<DictOptions[]>([
  { label: "全部", value: 0, tagType: "primary" },
  { label: "安卓", value: 1, tagType: "success" },
  { label: "IOS", value: 2, tagType: "warning" }
]);

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
const columns = reactive<ColumnProps<AppResource.ResAppResource>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "id", label: "序号", width: 80 },
  {
    prop: "resourceType",
    label: "资源类型",
    tag: true,
    enum: resourceTypeOptions,
    search: { el: "select", props: { filterable: true } }
  },
  { prop: "resourceKey", label: "资源key", search: { el: "input" } },
  { prop: "resourceName", label: "名称", search: { el: "input" } },
  {
    prop: "contentType",
    label: "内容类型",
    enum: contentTypeOptions,
    tag: true,
    search: { el: "select", props: { filterable: true } }
  },
  {
    prop: "content",
    label: "内容",
    search: { el: "input" }
  },
  {
    prop: "platform",
    label: "适用平台",
    enum: platformOptions,
    tag: true,
    search: { el: "select", props: { filterable: true } }
  },
  {
    prop: "sortOrder",
    label: "排序",
    width: 120,
    render(scope) {
      return (
        <span>
          {BUTTONS.value["*:*:*"] || BUTTONS.value["other:article:edit"] ? (
            <el-input-number
              v-model={scope.row.sortOrder}
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
              active-text={scope.row.status === 0 ? "启用" : "禁用"}
              active-value={0}
              inactive-value={1}
              onClick={() => changeStatus(scope.row)}
            />
          ) : (
            <el-tag type={scope.row.status === 0 ? "success" : "danger"}>{scope.row.status === 0 ? "启用" : "禁用"}</el-tag>
          )}
        </div>
      );
    }
  },
  { prop: "operation", label: "操作", width: 180, fixed: "right" }
]);

// 删除资源
const deleteAppResourceHandle = async (params: AppResource.ResAppResource) => {
  await useHandleData(deleteAppResource, params.id, `删除资源`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteAppResource, ids, t("main.deleteBatchMsg", { title: "资源" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof AppResourceDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<AppResource.ResAppResource> = {}) => {
  if (row.id) {
    const res = await getAppResourceById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addAppResource : title === "编辑" ? editAppResource : undefined,
    getTableList: proTable.value?.getTableList,
    resourceTypeOptions: resourceTypeOptions.value,
    platformOptions: platformOptions.value,
    contentTypeOptions: contentTypeOptions.value
  };
  drawerRef.value?.acceptParams(params);
};
const setSort = async (row: AppResource.ResAppResource) => {
  try {
    await editAppResource(row);
    proTable.value?.getTableList();
  } catch (error) {
    ElMessage.error("设置排序失败");
  }
};

// 切换状态
const changeStatus = async (row: Partial<AppResource.ResAppResource>) => {
  await useHandleData(editAppResource, { ...row, status: row.status === 1 ? 0 : 1 }, `切换【${row.resourceName}】资源状态`);
  proTable.value?.getTableList();
};
</script>
