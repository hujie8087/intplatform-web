<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getTableList"
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
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="default" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="primary" link :icon="Edit" @click="openDrawer('编辑', scope.row)">编辑</el-button>
          <el-button
            type="danger"
            link
            v-auth="['delivery:staff:remove']"
            :icon="Delete"
            @click="deleteDeliveryStationHandle(scope.row)"
          >
            删除
          </el-button>
        </template>
      </ProTable>
    </div>
    <BasicMessHallDrawer ref="drawerRef" />
  </div>
</template>
<script setup lang="tsx" name="BasicMessHall">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import BasicMessHallDrawer from "./components/BasicMessHallDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Delete, Edit, View, CirclePlus } from "@element-plus/icons-vue";
import {
  updateMessHall,
  changeMessHallStatus,
  getMessHall,
  addMessHall,
  delMessHall,
  listMessHall
} from "@/api/modules/mdc/system/order/messHall";
import { useI18n } from "vue-i18n";
import { BasicMessHall } from "@/api/interface/mealDelivery/basic/messHall";
import { userStatus } from "@/utils/serviceDict";

const { t } = useI18n(); // 解构出t方法
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

const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  return listMessHall(newParams);
};

// 表格配置项
const columns = reactive<ColumnProps<BasicMessHall.ResBasicMessHall>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 80 },
  {
    prop: "fdName",
    label: "食堂名称",
    search: { el: "input" }
  },
  {
    prop: "status",
    label: "状态",
    enum: userStatus,
    search: {
      el: "select"
    },
    render(scope) {
      return (
        <el-switch
          v-model={scope.row.status}
          active-value="0"
          inactive-value="1"
          before-change={() => {
            return useHandleData(changeMessHallStatus, scope.row.fdId.toString(), `修改【${scope.row.fdName}】食堂状态`);
          }}
        />
      );
    }
  },
  { prop: "createBy", label: "创建人" },
  { prop: "createTime", label: "创建时间" },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除反馈
const deleteDeliveryStationHandle = async (params: BasicMessHall.ResBasicMessHall) => {
  await useHandleData(delMessHall, params.fdId.toString(), `删除【${params.fdName}】食堂`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(delMessHall, ids, t("main.deleteBatchMsg", { title: "食堂" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof BasicMessHallDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<BasicMessHall.ResBasicMessHall> = {}) => {
  if (row.fdId) {
    const res = await getMessHall(row.fdId.toString());
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addMessHall : title === "编辑" ? updateMessHall : undefined,
    getTableList: proTable.value?.getTableList
  };
  drawerRef.value?.acceptParams(params);
};
</script>
