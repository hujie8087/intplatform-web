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
            >新增服务指南</el-button
          >
          <el-button
            type="danger"
            :disabled="!scope.isSelected"
            v-auth="['other:article:remove']"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除服务指南
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="success" link :icon="Edit" v-auth="['other:article:edit']" @click="openDrawer('编辑', scope.row)"
            >编辑</el-button
          >
          <el-button type="danger" link :icon="Delete" v-auth="['other:article:remove']" @click="deleteGuideHandle(scope.row)"
            >删除</el-button
          >
        </template>
      </ProTable>
      <GuideDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="Guide">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import GuideDrawer from "./components/GuideDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, Edit } from "@element-plus/icons-vue";
import { getGuideList, deleteGuide, editGuide, addGuide, getGuideById } from "@/api/modules/serviceGuide/guide";
import { Guide } from "@/api/interface/serviceGuide";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import { getGuideTypeList } from "@/api/modules/serviceGuide/guideType";
import { ElTag } from "element-plus";
import { useDict } from "@/hooks/useDict";

const { t } = useI18n(); // 解构出t方法

// 字典数据
const sys_normal_disable = ref<DictOptions[]>([]);
useDict("sys_normal_disable").then(res => {
  sys_normal_disable.value = res.sys_normal_disable;
});

const guideTypeOptions = ref<DictOptions[]>([]);

// 获取服务指南类型
const getGuideTypeData = async () => {
  const res = await getGuideTypeList({ pageNum: 1, pageSize: 1000 });
  guideTypeOptions.value = res.rows.map(item => {
    return {
      label: item.title,
      value: item.id
    };
  });
};
getGuideTypeData();
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
  { prop: "title", label: "指南名称", search: { el: "input", tooltip: "请输入指南名称" } },
  {
    prop: "img",
    label: "指南图标",
    render(scope) {
      return <span class="material-icons">{scope.row.img}</span>;
    }
  },
  {
    prop: "typeId",
    label: "指南类型",
    enum: guideTypeOptions,
    tag: true,
    search: { el: "select", props: { filterable: true } }
  },
  {
    prop: "isLogin ",
    label: "需要登录",
    width: 100,
    render(scope) {
      return <ElTag type={scope.row.isLogin === 1 ? "success" : "danger"}>{scope.row.isLogin === 1 ? "是" : "否"}</ElTag>;
    }
  },
  {
    prop: "status",
    label: "状态",
    enum: sys_normal_disable,
    tag: true,
    search: { el: "select", props: { filterable: true } },
    width: 100
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除服务指南
const deleteGuideHandle = async (params: Guide.ResGuide) => {
  await useHandleData(deleteGuide, params.id, `删除服务指南`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteGuide, ids, t("main.deleteBatchMsg", { title: "服务指南" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof GuideDrawer> | null>(null);
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
    guideTypeOptions: guideTypeOptions.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
