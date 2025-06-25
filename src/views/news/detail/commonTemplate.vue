<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getNoticeList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        :init-param="{ noticeType: props.noticeType }"
        row-key="noticeId"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" v-auth="['system:notice:add']" :icon="CirclePlus" @click="addNoticeHandle"
            >新增{{ props.title }}</el-button
          >
          <el-button
            type="danger"
            v-auth="['system:notice:remove']"
            :disabled="!scope.isSelected"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除{{ props.title }}
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" v-auth="['system:notice:query']" link :icon="View" @click="openViewDrawer(scope.row)"
            >查看</el-button
          >
          <el-button type="warning" v-auth="['system:notice:edit']" link :icon="EditPen" @click="openDrawer(scope.row)">
            编辑
          </el-button>
          <el-button type="danger" v-auth="['system:notice:remove']" link :icon="Delete" @click="deleteNoticeHandle(scope.row)"
            >删除</el-button
          >
          <el-button
            type="success"
            v-if="scope.row.approvalStatus === 0"
            link
            :icon="Stamp"
            v-auth="['system:notice:firstAudit']"
            @click="openAuditDrawer(scope.row)"
            >审核</el-button
          >
          <el-button
            type="success"
            v-if="scope.row.approvalStatus === 1"
            link
            :icon="Stamp"
            v-auth="['system:notice:secondAudit']"
            @click="openAuditDrawer(scope.row)"
            >审核</el-button
          >
          <el-button
            type="success"
            v-if="scope.row.approvalStatus === 3"
            link
            :icon="Stamp"
            v-auth="['system:notice:thirdAudit']"
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
    </div>
  </div>
</template>
<script setup lang="tsx" name="CommonTemplate">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, Stamp, View } from "@element-plus/icons-vue";
import { getNoticeList, deleteNotice, editNotice } from "@/api/modules/system/notice";
import { Dept, Notice } from "@/api/interface/system";
import { useI18n } from "vue-i18n";
import { useDict } from "@/hooks/useDict";
import { DictOptions } from "@/api/interface";
import { useRouter } from "vue-router";
import { auditStatus } from "@/utils/serviceDict";
import { ElMessage } from "element-plus";
import { useAuthButtons } from "@/hooks/useAuthButtons";
import { getDeptList } from "@/api/modules/system/dept";
import { useUserStore } from "@/stores/modules/user";
const router = useRouter();
const { t } = useI18n(); // 解构出t方法
const { BUTTONS } = useAuthButtons();
const userStore = useUserStore();

const props = defineProps<{
  noticeType: number;
  title: string;
}>();

// 字典数据
const sys_notice_status = ref<DictOptions[]>([]);
const sys_notice_type = ref<DictOptions[]>([]);
useDict("sys_notice_status", "sys_notice_type").then(res => {
  sys_notice_status.value = res.sys_notice_status;
  sys_notice_type.value = res.sys_notice_type;
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
const deptList = ref<Dept.ResDept[]>([]);
// 获取部门列表
const getDeptDataList = async () => {
  const res = await getDeptList({ pageNum: 1, pageSize: 10000 });
  deptList.value = res.data;
};
getDeptDataList();
// 表格配置项
const columns = reactive<ColumnProps<Notice.ResNotice>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 80 },
  { prop: "noticeTitle", label: "标题", search: { el: "input" } },
  { prop: "createDept", label: "发布部门", width: 120, search: { el: "input" } },
  {
    prop: "approvalStatus",
    label: "审核状态",
    width: 360,
    enum: auditStatus,
    search: { el: "select" },
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
    prop: "sort",
    label: "排序",
    width: 120,
    render(scope) {
      return (
        <span>
          {BUTTONS.value["*:*:*"] || BUTTONS.value["system:notice:edit"] ? (
            <el-input-number
              v-model={scope.row.sort}
              min={0}
              controls-position="right"
              style="width: 100px"
              onChange={() => setSort(scope.row)}
            />
          ) : (
            <span>{scope.row.sort}</span>
          )}
        </span>
      );
    }
  },
  {
    prop: "papeView",
    label: "浏览次数",
    width: 100
  },
  {
    prop: "status",
    label: "状态",
    enum: sys_notice_status,
    sortable: true,
    tag: true,
    width: 100,
    search: { el: "select" },
    render: scope => {
      return (
        <span>
          {BUTTONS.value["*:*:*"] || BUTTONS.value["system:notice:edit"] ? (
            <el-switch
              model-value={scope.row.status}
              active-text={scope.row.status ? "启用" : "禁用"}
              active-value={"0"}
              inactive-value={"1"}
              onClick={() => changeStatus(scope.row)}
            />
          ) : (
            <el-tag type={scope.row.status ? "success" : "danger"}>{scope.row.status ? "启用" : "禁用"}</el-tag>
          )}
        </span>
      );
    }
  },
  { prop: "createBy", label: "创建者", width: 120, search: { el: "input" } },
  {
    prop: "createTime",
    label: "创建时间",
    width: 160,
    sortable: true
  },
  { prop: "operation", label: "操作", width: 260, fixed: "right" }
]);

// 删除系统通知
const deleteNoticeHandle = async (params: Notice.ResNotice) => {
  await useHandleData(deleteNotice, params.noticeId, `删除【${params.noticeTitle}】${props.title}`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteNotice, ids, t("main.deleteBatchMsg", { title: props.title }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const openDrawer = async (row: Partial<Notice.ResNotice> = {}) => {
  router.push(`/news/editNews/${row.noticeId}`);
};

// 新增公司新闻
const addNoticeHandle = () => {
  router.push(`/news/addNews?type=${props.noticeType}`);
};

// 设置排序
const setSort = async (row: Notice.ResNotice) => {
  try {
    await editNotice(row);
    proTable.value?.getTableList();
  } catch (error) {
    ElMessage.error("设置排序失败");
  }
};

// 修改状态
const changeStatus = async (row: Notice.ResNotice) => {
  await useHandleData(
    editNotice,
    { ...row, status: row.status === "1" ? "0" : "1" },
    `切换【${row.noticeTitle}】${props.title}状态`
  );
  proTable.value?.getTableList();
};

// 打开审核 drawer
const openAuditDrawer = async (row: Partial<Notice.ResNotice> = {}, isAudit: boolean = true) => {
  router.push(`/news/auditNews/${row.noticeId}?isAudit=${isAudit}`);
};

// 打开查看 drawer
const openViewDrawer = async (row: Partial<Notice.ResNotice> = {}) => {
  router.push(`/news/viewNews/${row.noticeId}`);
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
