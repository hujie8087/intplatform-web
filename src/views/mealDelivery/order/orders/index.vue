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
        :init-param="initParam"
        row-key="orderNo"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="">
          <!-- 批量打印(小票) -->
          <el-button type="primary" :disabled="!proTable?.isSelected" :icon="Printer" @click="printTicket"
            >批量打印(小票)</el-button
          >
          <!-- 批量打印(A4) -->
          <el-button type="primary" :disabled="!proTable?.isSelected" :icon="Printer" @click="printA4">批量打印(A4)</el-button>
          <!-- 批量确认 -->
          <el-button
            type="success"
            v-mealAuth="['order:orders:confirmOrder']"
            :disabled="!proTable?.isSelected"
            :icon="Check"
            @click="batchConfirm"
            >批量确认</el-button
          >
          <!-- 修改订单信息 -->
          <el-button
            type="warning"
            v-mealAuth="['system:order:pcEdit']"
            :disabled="selectedList.length !== 1"
            :icon="Edit"
            @click="editOrderInfo"
            >修改订单信息</el-button
          >
          <!-- 导出结算单 -->
          <el-button type="danger" v-mealAuth="['order:orders:export']" :icon="Download" @click="handleBatchExportCheck"
            >导出核对</el-button
          >
          <!-- 导出查看结算任务列表 -->
          <el-button
            type="danger"
            plain
            v-mealAuth="['order:orders:export']"
            :icon="Download"
            @click="handleBatchExportCheckTaskTable"
            >查看核对任务列表</el-button
          >
        </template>
        <!-- Expand -->
        <template #expand="scope">
          <div class="card" style="margin: 0 10px" v-if="scope.row.foodType !== '2'">
            <el-table :data="scope.row.children" border style="width: 100%">
              <el-table-column prop="createTime" label="订单日期" align="center" />
              <el-table-column prop="userName" label="姓名" align="center" />
              <el-table-column prop="userNo" label="工号" align="center" />
              <el-table-column prop="postName" label="岗位" align="center" />
              <el-table-column prop="companyName" label="费用归属公司" align="center" />
              <el-table-column prop="deptName" label="部门名称" align="center" />
            </el-table>
          </div>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button
            v-show="scope.row.leaderStatus === '1' && scope.row.centerStatus === '2'"
            type="primary"
            link
            @click="submitOrder(scope.row)"
            v-mealAuth="['order:orders:confirmOrder']"
            >提交</el-button
          >
          <el-button
            v-show="scope.row.leaderStatus === '1' && scope.row.centerStatus === '2'"
            type="danger"
            link
            @click="rejectOrder(scope.row)"
            >驳回</el-button
          >
          <el-button
            style="margin: 0"
            v-show="scope.row.leaderStatus === '1' && scope.row.centerStatus === '3'"
            disabled
            size="small"
            type="text"
            >已提交至食堂
          </el-button>
          <el-tag v-show="scope.row.leaderStatus === '2'" disabled type="danger" size="small">已驳回</el-tag>
        </template>
      </ProTable>
      <!-- <MdcOrderDrawer ref="drawerRef" />-->
      <PrintTemplate ref="printTemplateRef" />
      <UserTaskListTable ref="userTaskListTableRef" />
      <UserTaskInfoForm ref="userTaskInfoFormRef" />
    </div>
    <!-- 修改弹窗 -->
    <el-dialog title="修改站点" v-model="openEditDialog" width="30%">
      <el-form :rules="rules" ref="editFormRef" :model="editForm" label-width="100px">
        <el-form-item label="站点" prop="deliveryId">
          <el-select v-model="editForm.deliveryId" placeholder="请选择站点" clearable filterable>
            <el-option
              v-for="dict in siteAddressDetailListOptions"
              :key="dict.fsId"
              :label="dict.fsAddressCn"
              :value="dict.fsId"
            />
          </el-select>
        </el-form-item>
        <!-- 新增的打包类型选择 -->
        <el-form-item label="打包类型" prop="packageType">
          <el-select v-model="editForm.deliveryType" placeholder="请选择打包类型" clearable>
            <el-option label="打包饭" value="0"></el-option>
            <el-option label="盒装饭" value="1"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="openEditDialog = false">取消</el-button>
        <el-button type="primary" @click="submitEditForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="tsx" name="MdcOrder">
import { ref, reactive, computed } from "vue";
import ProTable from "@/components/ProTable/index.vue";
// import MdcOrderDrawer from "./components/MdcOrderDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Check, Download, Edit, Printer } from "@element-plus/icons-vue";
import {
  confirmOrdersStatus,
  exportCheck,
  listOrders,
  orderReject,
  queryFoodOrderDeliverySummaryList,
  updateOrders,
  updatePrintStatus
} from "@/api/modules/mdc/system/order/orders";
import { DictOptions } from "@/api/interface";
import {
  getAllCarNameList,
  getAllMessHallNameList,
  getAllSiteAddressDetailList,
  getAllSiteAddressList
} from "@/api/modules/mdc/system";
import { queryUserTaskInfo } from "@/api/modules/mdc/monitor/usertask";
import UserTaskInfoForm from "@/components/UserTaskInfoForm/index.vue";
// import UserTaskListTable from "./components/UserTaskListTable.vue";
import UserTaskListTable from "@/components/UserTaskListTable/index.vue";
import dayjs from "dayjs";
import { MdcOrder } from "@/api/interface/mealDelivery/order";
import { useHandleData } from "@/hooks/useHandleData";
import { ElForm, ElMessage, FormRules } from "element-plus";
import PrintTemplate from "./components/PrintTemplate.vue";
import { BasicSite } from "@/api/interface/mealDelivery/basic/site";

const printTemplateRef = ref<InstanceType<typeof PrintTemplate>>();
const selectedList = computed(() => {
  return proTable.value?.selectedList.filter(item => item.orderNo) ?? [];
});
const openEditDialog = ref(false);
const checkOrder = ref<MdcOrder.ResMdcOrder>();
const editForm = ref({
  deliveryId: -1,
  deliveryType: ""
});
const rules = ref<FormRules>({
  deliveryId: [{ required: true, message: "站点不能为空", trigger: "blur" }],
  deliveryType: [{ required: true, message: "打包类型不能为空", trigger: "blur" }]
});
const editFormRef = ref<InstanceType<typeof ElForm>>();
const submitEditForm = () => {
  editFormRef.value?.validate(valid => {
    if (valid) {
      let siteAddressDetail = siteAddressDetailListOptions.value.find(
        siteAddressDetail => siteAddressDetail.fsId === editForm.value.deliveryId
      );
      if (siteAddressDetail) {
        updateOrders({
          ...checkOrder.value,
          ...editForm.value,
          fdId: siteAddressDetail.fdId,
          canteen: siteAddressDetail.fdName,
          deliverySite: siteAddressDetail.fsAddressCn,
          fcId: siteAddressDetail.fcId,
          fcName: siteAddressDetail.fcName
        }).then(response => {
          if (response.code === 200) {
            ElMessage.success("修改成功");
            openEditDialog.value = false;
            proTable.value?.clearSelection();
            proTable.value?.getTableList();
          }
        });
      }
    }
  });
};
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
// 字典数据
const packageTypeOptions = ref<DictOptions[]>([
  { label: "打包袋", value: "0", tagType: "primary" },
  { label: "餐盒", value: "1", tagType: "success" },
  { label: "桶装", value: "2", tagType: "warning" }
]);

const foodNameMap = ref<DictOptions[]>([
  { label: "早餐", value: "0", tagType: "primary" },
  { label: "午餐", value: "1", tagType: "success" },
  { label: "晚餐", value: "2", tagType: "warning" },
  { label: "夜宵", value: "3", tagType: "danger" },
  { label: "20L", value: "4", tagType: "info" },
  { label: "点心", value: "5", tagType: "warning" },
  { label: "凌晨餐", value: "6", tagType: "info" }
]);

// 出餐方式
const foodTypeOptions = ref<DictOptions[]>([
  { label: "中国餐", value: "0", tagType: "primary", idLabel: "Makanan Cina" },
  { label: "印尼餐", value: "1", tagType: "success", idLabel: "Makanan Indonesia" },
  { label: "桶装水", value: "2", tagType: "warning", idLabel: "Air Mineral" }
]);

const printStatusOptions = ref<DictOptions[]>([
  { label: "未打印", value: "0", tagType: "danger" },
  { label: "已打印", value: "1", tagType: "success" }
]);

const orderStatusOptions = ref<DictOptions[]>([
  { label: "已下单", value: "0", tagType: "danger" },
  { label: "配餐中", value: "1", tagType: "success" },
  { label: "送餐中", value: "2", tagType: "warning" },
  { label: "已送达", value: "3", tagType: "info" }
]);

const orderStatusMapping = (row: MdcOrder.ResMdcOrder): { text: string; color: string } => {
  const { orderStatus, centerStatus } = row;

  if ("0" === orderStatus && "1" === centerStatus) {
    // 班组已下单
    return { text: "班组已下单", color: "primary" };
  } else if ("0" === orderStatus && "2" === centerStatus) {
    // 部门已审核
    return { text: "部门已审核", color: "primary" };
  } else if ("1" === orderStatus && "3" === centerStatus) {
    // 餐厅备餐中
    return { text: "餐厅备餐中", color: "warning" };
  } else if ("3" === orderStatus && "3" === centerStatus) {
    // 取餐配送中
    return { text: "取餐配送中", color: "success" };
  } else if ("4" === orderStatus && "3" === centerStatus) {
    // 送达
    return { text: "已送达", color: "info" };
  }
  return { text: "未知", color: "danger" };
};

const orderDateTime = (row: MdcOrder.ResMdcOrder) => {
  const key = `${row.orderStatus}_${row.centerStatus}`;
  const timeMap = {
    "0_1": row.teamSubmitTime,
    "0_2": row.deptSubmitTime,
    "1_3": row.leadTime,
    "3_3": row.mealTime,
    "4_3": row.completeTime
  };

  return timeMap[key] ?? "";
};

const initParam = reactive({
  pageNum: 1,
  pageSize: 300,
  orderArrays: [],
  sourceType: 0,
  statusArrays: [2, 3]
});
const getTableList = (params: any) => {
  const newParams = JSON.parse(JSON.stringify(params)); // 深拷贝（可选）
  if (Array.isArray(newParams.orderDate) && newParams.orderDate.length === 2) {
    newParams.params = {
      beginTime: newParams.orderDate[0] + " 06:00:00",
      endTime: newParams.orderDate[1] + " 06:00:00"
    };
    delete newParams.orderDate;
  }
  return listOrders(newParams);
};

// 获取车辆列表
const carList = ref<DictOptions[]>([]);
const getCarList = async () => {
  const res = await getAllCarNameList();
  carList.value = res.data.map(item => ({
    label: item.fcName,
    value: item.fcId
  }));
};
getCarList();

// 获取食堂列表
const messHallListOptions = ref<DictOptions[]>([]);
const getMessHallList = async () => {
  const res = await getAllMessHallNameList();
  messHallListOptions.value = res.data.map(item => ({
    label: item.fdName,
    value: item.fdId
  }));
};
getMessHallList();

// 获取配送站点列表
const siteAddressListOptions = ref<DictOptions[]>([]);
const getSiteAddressList = async () => {
  const res = await getAllSiteAddressList();
  siteAddressListOptions.value = res.data.map(item => ({
    label: item.fsAddress,
    value: item.fsAddress
  }));
};
getSiteAddressList();

// 获取配送站点详情列表
const siteAddressDetailListOptions = ref<BasicSite.ResSiteAddressDetail[]>([]);
const getSiteDetailList = async (foodType: string) => {
  const res = await getAllSiteAddressDetailList(foodType);
  siteAddressDetailListOptions.value = res.data;
};
// 表格配置项
const expandedRowSet = ref(new Set());
// const orderDataCache = new Map();

/* function getCachedOrderData(row) {
  const key = row.orderNo;
  if (!orderDataCache.has(key)) {
    orderDataCache.set(key, getOrderData(row));
  }
  return orderDataCache.get(key);
} */
const initDateRange = () => {
  const now = new Date();
  const phi = new Date();
  phi.setHours(6, 0, 0, 0); // 设置为今天的6点
  let start, end;
  if (now < phi) {
    // now < phi
    start = dayjs().subtract(1, "day").format("YYYY-MM-DD");
    end = dayjs().format("YYYY-MM-DD");
  } else {
    // phi <= now
    start = dayjs().format("YYYY-MM-DD");
    end = dayjs().add(1, "day").format("YYYY-MM-DD");
  }
  return [start, end];
};
const columns = reactive<ColumnProps<MdcOrder.ResMdcOrder>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "expand", width: 30 },
  { prop: "orderNo", label: "订单编号", width: 160, search: { el: "input" } },
  {
    prop: "canteen",
    label: "出餐食堂",
    enum: messHallListOptions,
    render(scope) {
      return <div style="white-space: normal;">{scope.row.canteen}</div>;
    },
    search: { el: "select", props: { filterable: true } }
  },
  {
    prop: "deliverySite",
    label: "配送站点",
    width: 80,
    enum: siteAddressListOptions,
    search: {
      el: "select",
      props: {
        filterable: true
      }
    }
  },
  {
    prop: "orderDate",
    label: "订单日期",
    isShow: false,
    search: {
      span: 1,
      el: "date-picker",
      props: { type: "daterange", valueFormat: "YYYY-MM-DD" },
      defaultValue: initDateRange()
    }
  },
  { prop: "pNum", label: "数量", width: 60 },
  {
    prop: "createBy",
    label: "申报人",
    search: { el: "input" },
    render(scope) {
      return <div style="white-space: normal;">{scope.row.createBy}</div>;
    }
  },
  {
    prop: "phone",
    label: "联系方式",
    width: 100,
    render(scope) {
      return <div style="white-space: normal;">{scope.row.phone}</div>;
    }
  },
  { prop: "foodType", label: "餐饮类型", width: 70, enum: foodTypeOptions, tag: true, search: { el: "select" } },
  {
    prop: "foodName",
    label: "餐饮名称",
    width: 70,
    enum: foodNameMap,
    tag: true,
    search: {
      el: "select",
      props: {
        filterable: true
      }
    }
  },
  { prop: "packageType", label: "打包类型", width: 70, enum: packageTypeOptions, tag: true, search: { el: "select" } },
  {
    prop: "fcName",
    label: "车号",
    width: 60
  },
  {
    prop: "fcId",
    label: "车号",
    isShow: false,
    enum: carList,
    search: {
      el: "select",
      props: {
        filterable: true
      }
    }
  },
  {
    prop: "orderStatus",
    label: "订单状态",
    render(scope) {
      const rowId = scope.row.orderNo;
      const isExpanded = expandedRowSet.value.has(rowId);
      return (
        <div>
          <div
            class="table-column-order-status"
            v-show={!isExpanded}
            onClick={() => {
              expandedRowSet.value.add(rowId);
            }}
          >
            <el-tag type={orderStatusMapping(scope.row).color}>{orderStatusMapping(scope.row).text}</el-tag>
            <br />
            <span style="font-size: 12px; line-height: 12px; color: #909399">{orderDateTime(scope.row)}</span>
          </div>
          <div
            v-show={isExpanded}
            onClick={() => {
              expandedRowSet.value.delete(rowId);
            }}
          >
            <el-timeline reverse={false} style="padding: 0">
              {getOrderData(scope.row).map((activity, index) => (
                <el-timeline-item
                  key={index}
                  timestamp={activity.timestamp}
                  color={activity.color}
                  style="font-size: 12px; text-align: left;padding:0"
                >
                  {activity.content}
                </el-timeline-item>
              ))}
            </el-timeline>
          </div>
        </div>
      );
    }
  },
  { prop: "printed", label: "打印状态", width: 80, enum: printStatusOptions, tag: true, search: { el: "select" } },
  {
    prop: "orderArrays",
    label: "订单状态",
    isShow: false,
    enum: orderStatusOptions,
    tag: true,
    search: {
      el: "select",
      props: {
        multiple: true
      }
    }
  },
  { prop: "operation", label: "操作", width: 100, fixed: "right" }
]);

const getOrderData = (row: MdcOrder.ResMdcOrder): { timestamp: string; color: string; content: string }[] => {
  return [
    {
      timestamp: row.teamSubmitTime,
      color: row.teamSubmitTime ? "#0bbd87" : "#CCC",
      content: "班组已下单"
    },
    {
      timestamp: row.deptSubmitTime,
      color: row.deptSubmitTime ? "#0bbd87" : "#CCC",
      content: "部门已审核"
    },
    {
      timestamp: row.leadTime,
      color: row.leadTime ? "#0bbd87" : "#CCC",
      content: "餐厅备餐中"
    },
    {
      timestamp: row.mealTime,
      color: row.mealTime ? "#0bbd87" : "#CCC",
      content: "取餐配送中"
    },
    {
      timestamp: row.completeTime,
      color: row.completeTime ? "#0bbd87" : "#CCC",
      content: "已送达"
    }
  ];
};

const userTaskInfoFormRef = ref<InstanceType<typeof UserTaskInfoForm>>();
// 导出结算单
const handleBatchExportCheck = () => {
  // userTaskInfoFormRef.value?.create("报餐送餐系统-结算表" + new Date().getTime() + ".xlsx");
  let totalParam: any = { ...proTable.value?.totalParam };
  delete totalParam.orderDate;
  exportCheck({
    // ...proTable.value?.totalParam,
    ...totalParam,
    params: {
      beginTime: proTable.value?.searchParam.orderDate[0] + " 06:00:00",
      endTime: proTable.value?.searchParam.orderDate[1] + " 06:00:00"
    }
  }).then(res => {
    let taskId = res.data;
    userTaskInfoFormRef.value?.acceptParams({
      rowData: {},
      fileName: "报餐送餐系统-核对表" + new Date().getTime() + ".xlsx",
      api: queryUserTaskInfo,
      params: {
        taskId
      }
    });
  });
};

// 查看核对任务列表
const userTaskListTableRef = ref();
const handleBatchExportCheckTaskTable = () => {
  userTaskListTableRef.value.create({
    taskCategory: 3,
    dataOperate: 1,
    api: queryUserTaskInfo,
    fileName: "报餐送餐系统-核对表" + new Date().getTime() + ".xlsx"
  });
};
// 提交订单
const submitOrder = async (row: MdcOrder.ResMdcOrder) => {
  await useHandleData(confirmOrdersStatus, row.oId, "提交订单");
  proTable.value?.getTableList();
};

// 驳回订单
const rejectOrder = async (row: MdcOrder.ResMdcOrder) => {
  await useHandleData(orderReject, row.oId, "驳回订单");
  proTable.value?.getTableList();
};

// 批量确认
const batchConfirm = () => {
  useHandleData(
    confirmOrdersStatus,
    proTable.value?.selectedList.filter(item => item.orderNo).map(item => item.oId),
    "批量确认(" + proTable.value?.selectedList.filter(item => item.orderNo).length + ")条数据"
  );
};

// 修改订单信息
const editOrderInfo = async () => {
  openEditDialog.value = true;
  await getSiteDetailList(selectedList.value[0].foodType);
  checkOrder.value = selectedList.value[0] as MdcOrder.ResMdcOrder;
  editForm.value = {
    deliveryId: selectedList.value[0].deliveryId,
    deliveryType: selectedList.value[0].packageType
  };
};

const printOrderCallback = async (orderIds: number[]) => {
  const res = await updatePrintStatus(orderIds.join(","));
  console.log(res);
  if (res.code === 200) {
    ElMessage.success("打印成功");
    proTable.value?.getTableList();
  }
};

// 批量打印(小票)
const printTicket = async () => {
  let fcNameList: string[] = [];
  let foodTypeList: string[] = [];
  let ids: number[] = [];
  let selectedList = [...(proTable.value?.selectedList.filter(item => !item.userNo) ?? [])];
  console.log(selectedList);
  if (!selectedList.length) {
    ElMessage.warning("请选择要打印的订单!");
    return;
  }

  for (let i = 0; i < selectedList.length; i++) {
    const row = selectedList[i] as MdcOrder.ResMdcOrder;
    let centerStatus = row.centerStatus;
    if ("2" === centerStatus) {
      ElMessage.warning("待打印的数据中含有未提交的订单, 请先提交 !");
      return;
    }
    let leaderStatus = row.leaderStatus;
    if ("2" === leaderStatus) {
      ElMessage.warning("待打印的数据中含有已驳回的订单!");
      return;
    }
    if (row.foodType) {
      foodTypeList.push(row.foodType.trim());
    }
    if (row.fcName) {
      fcNameList.push(row.fcName.trim());
    }
    ids.push(row.oId);

    try {
      // 对每个 deptId 调用 listDeptExcludeChild
      // const persoInfo = await getDept(row.deptId);
      // 将返回的数据添加到行数据中
      selectedList[i].persoInfo = row.createBy;
    } catch (error) {
      console.error("Error fetching department info:", error);
      // 可以处理错误，例如显示消息或跳过当前行
    }
  }
  console.log(fcNameList.filter(item => item.trim()).length);
  if (fcNameList.filter(item => item.trim()).length > 1) {
    ElMessage.warning("请选择同一车号进行打印");
    return;
  }
  if (foodTypeList.filter(item => item.trim()).length > 1) {
    ElMessage.warning("请选择同一餐饮类型进行打印");
    return;
  }

  try {
    let res = await queryFoodOrderDeliverySummaryList(ids);
    // 获取要打印的区域
    const data = {
      data: res.data.map(item => {
        if (item.foodType === "0") {
          return {
            ...item,
            pageSize: 15,
            pageNumber: Math.ceil(item.num / 15)
          };
        } else {
          return {
            ...item,
            pageSize: 30,
            pageNumber: Math.ceil(item.num / 30)
          };
        }
      })
    };

    // 使用 Vue 3 的方式创建打印组件
    if (printTemplateRef.value) {
      // 设置打印回调
      printTemplateRef.value.printOrder(data.data, () => {
        printOrderCallback(ids);
      });
    } else {
      ElMessage.error("打印组件未初始化");
    }
  } catch (error) {
    console.error("打印失败:", error);
    ElMessage.error("打印失败，请重试");
  }
};

// 批量打印(A4)
const printA4 = async () => {
  let fcNameList: string[] = [];
  let foodTypeList: string[] = [];
  let ids: number[] = [];
  let selectedList = [...(proTable.value?.selectedList.filter(item => !item.userNo) ?? [])];
  for (let i = 0; i < selectedList.length; i++) {
    const row = selectedList[i];
    let leaderStatus = row["leaderStatus"];
    if ("2" === leaderStatus) {
      ElMessage.warning("待打印的数据中含有已驳回的订单!");
      return;
    }
    let centerStatus = row["centerStatus"];
    if ("2" === centerStatus) {
      ElMessage.warning("待打印的数据中含有未提交的订单, 请先提交 !");
      return;
    }
    if (row.foodType) {
      foodTypeList.push(row.foodType.trim());
    }
    if (row.fcName) {
      fcNameList.push(row.fcName.trim());
    }
    ids.push(row.oId);
    try {
      // 对每个 deptId 调用 listDeptExcludeChild
      // const persoInfo = await getDept(row.deptId);
      // 将返回的数据添加到行数据中
      selectedList[i].persoInfo = row.createBy;
    } catch (error) {
      console.error("Error fetching department info:", error);
      // 可以处理错误，例如显示消息或跳过当前行
    }
  }
  if (selectedList.length > 0 && selectedList.some(item => item.orderStatus === 4)) {
    ElMessage.warning("待打印的数据中含有未提交的订单, 请先提交 !");
    return;
  }
  if ([...new Set(fcNameList)].length > 1) {
    ElMessage.warning("请选择同一车号进行打印");
    return;
  }
  if ([...new Set(foodTypeList)].length > 1) {
    ElMessage.warning("请选择同一餐饮类型进行打印");
    return;
  }
  try {
    let res = await queryFoodOrderDeliverySummaryList(ids);
    // 获取要打印的区域
    const data = {
      data: res.data,
      foodTypeList,
      foodTypeOptions: foodTypeOptions.value
    };
    // 使用 Vue 3 的方式创建打印组件
    if (printTemplateRef.value) {
      // 设置打印回调
      printTemplateRef.value.printOrderA4(data, () => {
        printOrderCallback(ids);
      });
    } else {
      ElMessage.error("打印组件未初始化");
    }
  } catch (error) {
    console.error("打印失败:", error);
    ElMessage.error("打印失败，请重试");
  }
};
</script>
<style lang="scss" scoped>
:deep(.el-table--small .cell) {
  padding: 0 4px;
}
</style>
