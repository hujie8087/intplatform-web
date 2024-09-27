<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        title="报修类型管理"
        highlight-current-row
        :columns="columns"
        :request-api="getGuideTypeList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" v-auth="['other:type:add']" @click="openDrawer('新增')"
            >新增指南类型</el-button
          >
          <el-button
            type="danger"
            :disabled="!scope.isSelected"
            :icon="Delete"
            v-auth="['other:type:remove']"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button
            type="success"
            link
            v-if="scope.row.userId !== 1"
            v-auth="['other:type:edit']"
            :icon="EditPen"
            @click="openDrawer('编辑', scope.row)"
          >
            编辑
          </el-button>
          <el-button type="danger" link :icon="Delete" v-auth="['other:type:remove']" @click="deleteGuideTypeHandle(scope.row)"
            >删除</el-button
          >
        </template>
      </ProTable>
      <GuideTypeDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="GuideType">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import GuideTypeDrawer from "./components/GuideTypeDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import {
  getGuideTypeList,
  deleteGuideType,
  editGuideType,
  addGuideType,
  getGuideTypeById
} from "@/api/modules/serviceGuide/guideType";
import { useI18n } from "vue-i18n";
import { useDict } from "@/hooks/useDict";
import { DictOptions } from "@/api/interface";
import { GuideType } from "@/api/interface/serviceGuide";
import { ElTag } from "element-plus";

const { t } = useI18n(); // 解构出t方法

// 字典数据
const sys_normal_disable = ref<DictOptions[]>([]);
useDict("sys_normal_disable").then(res => {
  sys_normal_disable.value = res.sys_normal_disable;
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
const columns = reactive<ColumnProps<GuideType.ResGuideType>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "id", label: "序号", width: 80 },
  { prop: "title", label: "指南类型名称", search: { el: "input", tooltip: "请输入指南类型名称" } },
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
    sortable: true,
    tag: true,
    search: { el: "select", props: { filterable: true } },
    width: 100
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除指南类型
const deleteGuideTypeHandle = async (params: GuideType.ResGuideType) => {
  await useHandleData(deleteGuideType, params.id, `删除【${params.title}】指南类型`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteGuideType, ids, t("main.deleteBatchMsg", { title: "指南类型" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof GuideTypeDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<GuideType.ResGuideType> = {}) => {
  if (row.id) {
    const res = await getGuideTypeById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addGuideType : title === "编辑" ? editGuideType : undefined,
    getTableList: proTable.value?.getTableList,
    repairTypeStatusOptions: sys_normal_disable.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
