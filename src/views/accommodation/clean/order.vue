<template>
  <div class="main-box">
    <TreeFilter
      ref="treeFilterRef"
      title="区域列表(多选)"
      multiple
      label="title"
      :request-api="getAllBuildingTree"
      :default-value="treeFilterValues.ancestors"
      :check-strictly="true"
      @change="changeTreeFilter"
    />
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getCleanOrderList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        :init-param="initParam"
        row-key="id"
      >
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button
            type="warning"
            link
            v-auth="['clean:order:edit']"
            :disabled="scope.row.orderStatus !== 0"
            @click="openHandleDrawer(scope.row)"
          >
            处理
          </el-button>
          <!-- 退款 -->
          <el-button
            type="danger"
            link
            v-auth="['clean:order:refund']"
            :disabled="scope.row.orderStatus !== 0"
            @click="refundHandler(scope.row)"
          >
            退款
          </el-button>
        </template>
      </ProTable>
      <CleanOrderDrawer ref="cleanOrderDrawerRef" />
    </div>
    <el-dialog v-model="handleDialogVisible" title="办理保洁订单" width="500" destroy-on-close center>
      <el-form :model="checkOrder" label-width="100px" :rules="rules" ref="checkOrderRef">
        <el-form-item label="保洁日期" prop="handleTime">
          <el-date-picker
            v-model="checkOrder!.handleTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择保洁日期"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align: right">
          <el-button @click="handleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="tsx" name="CleanOrder">
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import CleanOrderDrawer from "./components/CleanOrderDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { View } from "@element-plus/icons-vue";
import {
  getCleanOrderList,
  editCleanOrder,
  getCleanOrderById,
  getCleanList,
  refundCleanOrder
} from "@/api/modules/service/accommodation";
import { Accommodation } from "@/api/interface/service/accommodation";
import { DictOptions } from "@/api/interface";
import TreeFilter from "@/components/TreeFilter/index.vue";
import { getAllBuildingTree } from "@/api/modules/productDisplay/building";
import { useDict } from "@/hooks/useDict";
import { useHandleData } from "@/hooks/useHandleData";
import { sendMessage } from "@/api/modules/system/notice";
import { getUserInfoByUsername } from "@/api/modules/system/user";
import { ElForm } from "element-plus";

import { useUserStore } from "@/stores/modules/user";

const userStore = useUserStore();

const handleDialogVisible = ref(false);
const checkOrder = ref<Accommodation.ResCleanOrder>();
const checkOrderRef = ref<InstanceType<typeof ElForm>>();
const rules = reactive({
  handleTime: [{ required: true, message: "请选择保洁日期", trigger: "blur" }]
});
// 默认 treeFilter 参数
const treeFilterValues = reactive({ ancestors: [] as number[] });
const changeTreeFilter = (val: number[]) => {
  proTable.value!.pageable.pageNum = 1;
  treeFilterValues.ancestors = val;
  initParam.ancestors = treeFilterValues.ancestors.join(",");
};
const initParam = reactive({ ancestors: "" });

const cleanProjectOptions = ref<DictOptions[]>([]);

const getCleanProjectOptions = async () => {
  const res = await getCleanList({ pageNum: 1, pageSize: 9999 });
  cleanProjectOptions.value = res.rows.map(item => ({
    label: item.projectDetails,
    value: item.id
  }));
};
getCleanProjectOptions();

// 收费类别
const chargeTypeOptions = ref<DictOptions[]>([
  {
    label: "深度保洁",
    value: 0,
    tagType: "success"
  },
  {
    label: "专项保洁",
    value: 1,
    tagType: "warning"
  }
]);

const orderStatus = ref<DictOptions[]>([]);
useDict("clean_order_status").then(res => {
  orderStatus.value = res.clean_order_status.map(item => ({
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

const openHandleDrawer = async (row: Accommodation.ResCleanOrder) => {
  checkOrder.value = row;
  handleDialogVisible.value = true;
  // await useHandleData(editCleanOrder, { ...row, orderStatus: 1 }, "办理保洁订单");
  // proTable.value?.getTableList();
};

const handleConfirm = async () => {
  checkOrderRef.value?.validate(async valid => {
    if (valid) {
      await useHandleData(
        editCleanOrder,
        { ...checkOrder.value, orderStatus: 1, handler: userStore.userInfo.user.userName },
        "办理保洁订单"
      );
      handleDialogVisible.value = false;
      checkOrderRef.value?.resetFields();
      if (checkOrder.value) {
        // 获取用户详情
        const res = await getUserInfoByUsername(checkOrder.value.createBy!);
        if (res.msg) {
          let title = checkOrder.value?.orderStatus === 1 ? "您的保洁单已完成" : "您的保洁单已完成";
          sendMessage({
            title: title,
            body: checkOrder.value.clArea + "/" + checkOrder.value.roomNo,
            type: "1",
            payload: ``,
            userName: checkOrder.value.createBy!,
            equipmentToken: res.msg
          });
        }
      }
      proTable.value?.getTableList();
    }
  });
};

// 表格配置项
const columns = reactive<ColumnProps<Accommodation.ResCleanOrder>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 50 },
  { prop: "clNo", label: "清洁单号", width: 140, search: { el: "input", tooltip: "请输入清洁单号" } },
  { prop: "contacts", label: "联系人", width: 100, search: { el: "input", tooltip: "请输入联系人" } },
  { prop: "tel", label: "联系电话", width: 100, search: { el: "input", tooltip: "请输入联系电话" } },
  {
    prop: "cpId",
    label: "清洁项目",
    width: 100,
    enum: cleanProjectOptions,
    tag: true,
    search: { el: "select", props: { filterable: true } }
  },
  { prop: "clArea", label: "清洁区域", width: 100 },
  { prop: "roomNo", label: "房间号", search: { el: "input", tooltip: "请输入房间号" } },
  { prop: "reserveDate", label: "预约日期", width: 100 },
  { prop: "cleanPrice", label: "清洁价格", width: 100 },
  {
    prop: "orderStatus",
    label: "订单状态",
    tag: true,
    width: 100,
    enum: orderStatus,
    search: { el: "select", props: { filterable: true } }
  },
  { prop: "createTime", label: "创建时间", width: 160 },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 退款
const refundHandler = async (row: Accommodation.ResCleanOrder) => {
  await useHandleData(refundCleanOrder, row.id, "确认退款");
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const cleanOrderDrawerRef = ref<InstanceType<typeof CleanOrderDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Accommodation.ResCleanOrder> = {}) => {
  if (row.id) {
    const res = await getCleanOrderById(row.id);
    row = res.data;
  }
  const params = {
    title,
    rowData: { ...row },
    api: title === "办理" ? editCleanOrder : undefined,
    getTableList: proTable.value?.getTableList,
    chargeTypeOptions: chargeTypeOptions.value,
    cleanProjectOptions: cleanProjectOptions.value,
    orderStatusOptions: orderStatus.value
  };
  cleanOrderDrawerRef.value?.acceptParams(params);
};

const treeFilterRef = ref<InstanceType<typeof TreeFilter>>();
</script>
