<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getAppMenuList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" v-auth="['other:article:add']" @click="openDrawer('新增')">新增</el-button>
          <el-button
            type="danger"
            :disabled="!scope.isSelected"
            v-auth="['other:article:remove']"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="warning" link :icon="Edit" v-auth="['other:article:edit']" @click="openDrawer('编辑', scope.row)"
            >编辑</el-button
          >
          <el-button type="danger" link :icon="Delete" v-auth="['other:article:remove']" @click="deleteAppMenuHandle(scope.row)"
            >删除</el-button
          >
        </template>
      </ProTable>
      <AppMenuDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="AppMenu">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import AppMenuDrawer from "./components/AppMenuDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, Edit, View } from "@element-plus/icons-vue";
import { getAppMenuList, deleteAppMenu, editAppMenu, addAppMenu, getAppMenuById } from "@/api/modules/system/appMenu";
import { AppMenu } from "@/api/interface/system";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import { getAppMenuTypeList } from "@/api/modules/system/appMenu";
import { ElMessage } from "element-plus";
import { useDict } from "@/hooks/useDict";
import { useAuthButtons } from "@/hooks/useAuthButtons";
import { tagTypeOptions } from "@/utils/serviceDict";
const { t } = useI18n(); // 解构出t方法
const { BUTTONS } = useAuthButtons();
// 字典数据
const sys_normal_disable = ref<DictOptions[]>([]);
useDict("sys_normal_disable").then(res => {
  sys_normal_disable.value = res.sys_normal_disable;
});

const guideTypeOptions = ref<DictOptions[]>([]);

// 获取服务指南类型
const getAppMenuTypeData = async () => {
  const res = await getAppMenuTypeList({ pageNum: 1, pageSize: 1000 });
  guideTypeOptions.value = res.rows.map(item => {
    return {
      label: item.cname,
      value: item.id,
      tagType: tagTypeOptions[item.id % tagTypeOptions.length]
    };
  });
};
getAppMenuTypeData();

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
const columns = reactive<ColumnProps<AppMenu.ResAppMenu>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "id", label: "序号", width: 80 },
  {
    prop: "typeId",
    label: "菜单分类",
    enum: guideTypeOptions,
    tag: true,
    search: { el: "select", props: { filterable: true } }
  },
  { prop: "cname", label: "菜单中文名称", search: { el: "input", tooltip: "请输入菜单中文名称" } },
  { prop: "uname", label: "菜单英文名称", search: { el: "input", tooltip: "请输入菜单英文名称" } },
  { prop: "yname", label: "菜单印尼名称", search: { el: "input", tooltip: "请输入菜单印尼名称" } },
  {
    prop: "icon",
    label: "菜单图标",
    render(scope) {
      return <span class="material-icons">{scope.row.icon}</span>;
    }
  },
  {
    prop: "router",
    label: "菜单路由",
    search: { el: "input", tooltip: "请输入菜单路由" }
  },
  {
    prop: "permissions",
    label: "菜单权限",
    search: { el: "input", tooltip: "请输入菜单权限" }
  },

  {
    prop: "isLogin ",
    label: "需要登录",
    width: 100,
    render(scope) {
      return (
        <div>
          {BUTTONS.value["*:*:*"] || BUTTONS.value["other:article:edit"] ? (
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
        </div>
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
    prop: "isMic",
    label: "是否Badge",
    enum: sys_normal_disable,
    tag: true,
    search: { el: "select", props: { filterable: true } },
    width: 100,
    render(scope) {
      return <el-tag type={scope.row.isMic === 0 ? "danger" : "success"}>{scope.row.isMic === 0 ? "否" : "是"}</el-tag>;
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

// 删除菜单
const deleteAppMenuHandle = async (params: AppMenu.ResAppMenu) => {
  await useHandleData(deleteAppMenu, params.id, `删除菜单`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteAppMenu, ids, t("main.deleteBatchMsg", { title: "菜单" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof AppMenuDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<AppMenu.ResAppMenu> = {}) => {
  if (row.id) {
    const res = await getAppMenuById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addAppMenu : title === "编辑" ? editAppMenu : undefined,
    getTableList: proTable.value?.getTableList,
    guideTypeOptions: guideTypeOptions.value
  };
  drawerRef.value?.acceptParams(params);
};
const setSort = async (row: AppMenu.ResAppMenu) => {
  try {
    await editAppMenu(row);
    proTable.value?.getTableList();
  } catch (error) {
    ElMessage.error("设置排序失败");
  }
};

// 切换状态
const changeStatus = async (row: Partial<AppMenu.ResAppMenu>) => {
  await useHandleData(editAppMenu, { ...row, status: row.status === 1 ? 0 : 1 }, `切换【${row.cname}】菜单状态`);
  proTable.value?.getTableList();
};

// 切换是否需要登录
const changeIsLogin = async (row: Partial<AppMenu.ResAppMenu>) => {
  await useHandleData(
    editAppMenu,
    { ...row, nextApprovalFlag: 0, isLogin: row.isLogin === 1 ? 0 : 1 },
    `切换【${row.cname}】菜单是否需要登录`
  );
  proTable.value?.getTableList();
};
</script>
