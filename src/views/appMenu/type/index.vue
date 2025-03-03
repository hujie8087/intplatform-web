<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        title="app菜单类型管理"
        highlight-current-row
        :columns="columns"
        :request-api="getAppMenuTypeList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" v-auth="['other:type:add']" @click="openDrawer('新增')">新增</el-button>
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
          <el-button type="info" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="warning" link v-auth="['other:type:edit']" :icon="EditPen" @click="openDrawer('编辑', scope.row)"
            >编辑</el-button
          >
          <el-button type="danger" link :icon="Delete" v-auth="['other:type:remove']" @click="deleteAppMenuTypeHandle(scope.row)"
            >删除</el-button
          >
        </template>
      </ProTable>
      <AppMenuTypeDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="AppMenuType">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import AppMenuTypeDrawer from "./components/AppMenuTypeDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import {
  getAppMenuTypeList,
  deleteAppMenuType,
  editAppMenuType,
  addAppMenuType,
  getAppMenuTypeById
} from "@/api/modules/system/appMenu";
import { useI18n } from "vue-i18n";
import { useDict } from "@/hooks/useDict";
import { DictOptions } from "@/api/interface";
import { AppMenuType } from "@/api/interface/system";
import { useAuthButtons } from "@/hooks/useAuthButtons";
import { ElMessage } from "element-plus";
const { BUTTONS } = useAuthButtons();

const { t } = useI18n(); // 解构出t方法

// 字典数据
const sys_normal_disable = ref<DictOptions[]>([]);
useDict("sys_normal_disable").then(res => {
  sys_normal_disable.value = res.sys_normal_disable.map(item => ({
    label: item.label,
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
const columns = reactive<ColumnProps<AppMenuType.ResAppMenuType>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "id", label: "序号", width: 80 },
  { prop: "cname", label: "中文名称", search: { el: "input", tooltip: "请输入中文名称" } },
  { prop: "uname", label: "英文名称", search: { el: "input", tooltip: "请输入英文名称" } },
  { prop: "yname", label: "印尼语名称", search: { el: "input", tooltip: "请输入印尼语名称" } },
  { prop: "permissions", label: "权限标识" },
  {
    prop: "icon",
    width: 120,
    label: "图标",
    render(scope) {
      return <span class="material-icons">{scope.row.icon}</span>;
    }
  },
  {
    prop: "isLogin ",
    label: "需要登录",
    width: 120,
    render(scope) {
      return (
        <span>
          {BUTTONS.value["*:*:*"] || BUTTONS.value["other:type:edit"] ? (
            <el-switch
              model-value={scope.row.isLogin}
              active-text={scope.row.isLogin === 1 ? "是" : "否"}
              active-value={1}
              inactive-value={0}
              onClick={() => changeIsLogin(scope.row)}
            />
          ) : (
            <el-tag type={scope.row.isLogin === 1 ? "success" : "danger"}>{scope.row.isLogin === 1 ? "是" : "否"}</el-tag>
          )}
        </span>
      );
    }
  },
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
    sortable: true,
    tag: true,
    search: { el: "select", props: { filterable: true } },
    width: 120,
    render(scope) {
      return (
        <span>
          {BUTTONS.value["*:*:*"] || BUTTONS.value["other:type:edit"] ? (
            <el-switch
              model-value={scope.row.status}
              active-text={scope.row.status ? "启用" : "禁用"}
              active-value={0}
              inactive-value={1}
              onClick={() => changeStatus(scope.row)}
            />
          ) : (
            <el-tag type={scope.row.status ? "success" : "danger"}>{scope.row.status ? "启用" : "禁用"}</el-tag>
          )}
        </span>
      );
    }
  },
  { prop: "operation", label: "操作", width: 260, fixed: "right" }
]);

// 删除app菜单类型
const deleteAppMenuTypeHandle = async (params: AppMenuType.ResAppMenuType) => {
  await useHandleData(deleteAppMenuType, params.id, `删除【${params.cname}】app菜单类型`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteAppMenuType, ids, t("main.deleteBatchMsg", { title: "app菜单类型" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof AppMenuTypeDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<AppMenuType.ResAppMenuType> = {}) => {
  if (row.id) {
    const res = await getAppMenuTypeById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addAppMenuType : title === "编辑" ? editAppMenuType : undefined,
    getTableList: proTable.value?.getTableList,
    repairTypeStatusOptions: sys_normal_disable.value
  };
  drawerRef.value?.acceptParams(params);
};

// 设置排序
const setSort = async (row: AppMenuType.ResAppMenuType) => {
  try {
    await editAppMenuType(row);
    proTable.value?.getTableList();
  } catch (error) {
    ElMessage.error("设置排序失败");
  }
};

// 修改需要登录
const changeIsLogin = async (row: AppMenuType.ResAppMenuType) => {
  await editAppMenuType({ ...row, isLogin: row.isLogin === 1 ? 0 : 1 });
  proTable.value?.getTableList();
};

// 修改状态
const changeStatus = async (row: AppMenuType.ResAppMenuType) => {
  await editAppMenuType({ ...row, status: row.status === 1 ? 0 : 1 });
  proTable.value?.getTableList();
};
</script>
