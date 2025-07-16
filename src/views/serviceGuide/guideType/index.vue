<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        title="服务指南管理"
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
            >新增服务指南</el-button
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
          <el-button type="warning" link v-auth="['other:type:edit']" :icon="EditPen" @click="openDrawer('编辑', scope.row)"
            >编辑</el-button
          >
          <el-button type="danger" link :icon="Delete" v-auth="['other:type:remove']" @click="deleteGuideTypeHandle(scope.row)"
            >删除</el-button
          >
          <el-button
            type="success"
            v-if="scope.row.approvalStatus === 0"
            link
            :icon="Stamp"
            v-auth="['other:type:firstAudit']"
            @click="openAuditDrawer(scope.row)"
            >审核</el-button
          >
          <el-button
            type="success"
            v-if="scope.row.approvalStatus === 1"
            link
            :icon="Stamp"
            v-auth="['other:type:secondAudit']"
            @click="openAuditDrawer(scope.row)"
            >审核</el-button
          >
          <el-button
            type="success"
            v-if="scope.row.approvalStatus === 3"
            link
            :icon="Stamp"
            v-auth="['other:type:thirdAudit']"
            @click="openAuditDrawer(scope.row)"
            >审核</el-button
          >
          <el-button
            type="success"
            v-if="scope.row.approvalStatus === 2 && userStore.userInfo.user.deptId === scope.row.approvalDeptId"
            link
            :icon="Stamp"
            v-auth="['other:type:otherAudit']"
            @click="openAuditDrawer(scope.row)"
            >审核</el-button
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
import { CirclePlus, Delete, EditPen, Stamp, View } from "@element-plus/icons-vue";
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
import { useRouter } from "vue-router";
import { useAuthButtons } from "@/hooks/useAuthButtons";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/modules/user";
import { Dept } from "@/api/interface/system";
import { getDeptList } from "@/api/modules/system/dept";
import { auditStatus } from "@/utils/serviceDict";
const { BUTTONS } = useAuthButtons();

const router = useRouter();
const { t } = useI18n(); // 解构出t方法

const userStore = useUserStore();

const deptList = ref<Dept.ResDept[]>([]);
// 获取部门列表
const getDeptDataList = async () => {
  const res = await getDeptList({ pageNum: 1, pageSize: 10000 });
  deptList.value = res.data;
};
getDeptDataList();

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
  { prop: "title", label: "指南名称", search: { el: "input", tooltip: "请输入指南名称" } },
  {
    prop: "img",
    width: 120,
    label: "指南图标",
    render(scope) {
      return <span class="material-icons">{scope.row.img}</span>;
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
    prop: "approvalStatus",
    label: "审核状态",
    width: 320,
    render(scope) {
      const deptName = deptList.value.find(item => item.deptId === scope.row.approvalDeptId)?.deptName ?? "其他";
      return (
        <span>
          {scope.row.approvalStatus !== -1 ? (
            <el-steps active={scope.row.approvalStatus} finish-status="success" align-center>
              {auditStatus.map(item => (
                <el-step key={item.value} title={item.value === "3" ? `${deptName}审核` : item.label} />
              ))}
            </el-steps>
          ) : (
            <span style="color: #ff4949">已拒绝，请重新提交，原因:{scope.row.approvalMessage}</span>
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
    width: 120
  },
  { prop: "operation", label: "操作", width: 260, fixed: "right" }
]);

// 删除指南类型
const deleteGuideTypeHandle = async (params: GuideType.ResGuideType) => {
  await useHandleData(deleteGuideType, params.id, `删除【${params.title}】服务指南`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteGuideType, ids, t("main.deleteBatchMsg", { title: "服务指南" }));
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

// 切换是否需要登录
const changeIsLogin = async (row: Partial<GuideType.ResGuideType>) => {
  await useHandleData(
    editGuideType,
    { ...row, nextApprovalFlag: 0, isLogin: row.isLogin === 1 ? 0 : 1 },
    `切换【${row.title}】服务指南App端是否需要登录`
  );
  proTable.value?.getTableList();
};

// 设置排序
const setSort = async (row: GuideType.ResGuideType) => {
  try {
    await editGuideType({ ...row, nextApprovalFlag: 0 });
    proTable.value?.getTableList();
  } catch (error) {
    ElMessage.error("设置排序失败");
  }
};

// 打开审核 drawer
const openAuditDrawer = async (row: Partial<GuideType.ResGuideType> = {}) => {
  router.push(`/serviceGuide/guideTypeAudit/${row.id}`);
};
</script>

<style lang="scss" scoped>
:deep(.el-steps) {
  .el-step__icon {
    width: 20px;
    height: 20px;
    font-size: 10px;
    line-height: 20px;
    &.is-text {
      border: 1px solid;
    }
  }
  .el-step__title {
    font-size: 10px;
    line-height: 20px;
  }
}
</style>
