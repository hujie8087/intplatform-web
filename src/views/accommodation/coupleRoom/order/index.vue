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
        <template #tableHeader>
          <el-button type="warning" :icon="Download" @click="exportHandler">导出</el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <!-- 钥匙 -->
          <el-button
            type="primary"
            link
            v-auth="['room:order:keychain']"
            :disabled="scope.row.status !== 10 || scope.row.freeze"
            @click="changeKey(scope.row)"
            >钥匙</el-button
          >
          <!-- 冻结 -->
          <el-button
            type="warning"
            v-if="scope.row.freeze"
            v-auth="['room:order:freeze']"
            link
            @click="unfreezeDialogHandler(scope.row)"
            >解冻</el-button
          >
          <!-- 解冻 -->
          <el-button
            type="warning"
            v-else
            v-auth="['room:order:freeze']"
            :disabled="scope.row.status !== 10 || scope.row.keychain === 2 || scope.row.keychain === 3"
            link
            @click="freezeCoupleRoomOrderHandler(scope.row)"
            >冻结</el-button
          >
          <!-- 审核 -->
          <el-button
            type="success"
            link
            v-auth="['room:order:audit']"
            :disabled="scope.row.status !== 1"
            @click="auditDialogHandler(scope.row)"
            >审核</el-button
          >
          <!-- 退款 -->
          <el-button type="danger" link v-auth="['room:order:refund']" @click="refundHandler(scope.row)">退款</el-button>
          <!-- 查看 -->
          <el-button type="info" link @click="openDrawer('查看', scope.row)">查看</el-button>
        </template>
      </ProTable>
    </div>
    <CoupleRoomOrderDrawer ref="orderDrawerRef" />
    <!-- 解冻弹窗 -->
    <el-dialog v-model="unfreezeDialogVisible" title="解冻" width="30%">
      <el-form :model="unfreezeForm" label-width="120px">
        <el-form-item label="房间号">
          <el-select v-model="unfreezeForm.chamberName" @change="handleChamberChange">
            <el-option v-for="item in chamberOptions" :key="item.id" :label="item.name" :value="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期" prop="value1">
          <el-date-picker
            v-model="unfreezeForm.value1"
            type="daterange"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="danger" @click="unfreezeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUnfreezeSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 审核弹窗 -->
    <el-dialog v-model="auditDialogVisible" title="审核" width="30%">
      <el-form ref="form" :model="auditForm" label-width="80px">
        <el-form-item label="结果" prop="status">
          <el-radio-group v-model="auditForm.status">
            <el-radio :label="'1'">同意</el-radio>
            <el-radio :label="'2'">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="意见" prop="content">
          <el-input type="textarea" v-model="auditForm.content"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="danger" @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAuditSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="tsx" name="CoupleRoomOrder">
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Download } from "@element-plus/icons-vue";
import { CoupleRoom } from "@/api/interface/service/coupleRoom";
import {
  getCoupleRoomOrderList,
  editCoupleRoomOrder,
  freezeCoupleRoomOrder,
  getChamberAvailableList,
  auditCoupleRoomOrder,
  refundCoupleRoomOrder,
  getCoupleRoomOrderDetail
} from "@/api/modules/service/coupleRoom";
import CoupleRoomOrderDrawer from "./components/CoupleRoomOrderDrawer.vue";
import { useDict } from "@/hooks/useDict";
import { DictOptions } from "@/api/interface";
import dayjs from "dayjs";
import { useHandleData } from "@/hooks/useHandleData";
import { useUserStore } from "@/stores/modules/user";
import { computed } from "vue";
import { ElMessage } from "element-plus";
import { getUserInfoByUsername } from "@/api/modules/system/user";
import { sendMessage } from "@/api/modules/system/notice";
import { useDownload } from "@/hooks/useDownload";

const userStore = useUserStore();
const username = computed(() => userStore.userInfo.user.nickName);
const baseUrl = import.meta.env.VITE_API_URL;
const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  if (newParams.startTime) {
    newParams.beginStartTime = newParams.startTime[0];
    newParams.endStartTime = newParams.startTime[1];
    delete newParams.startTime;
  }
  if (newParams.endTime) {
    newParams.beginEndTime = newParams.endTime[0];
    newParams.endEndTime = newParams.endTime[1];
    delete newParams.endTime;
  }
  return getCoupleRoomOrderList(newParams);
};

const orderStatus = ref<DictOptions[]>([]);
const coupleRoomArea = ref<DictOptions[]>([]);
useDict("couple_order_status", "couple_room_area").then(res => {
  orderStatus.value = res.couple_order_status.map(item => ({
    ...item,
    value: +item.value
  }));
  coupleRoomArea.value = res.couple_room_area.map(item => ({
    ...item,
    value: +item.value
  }));
});

const chamberOptions = ref<CoupleRoom.ResRoom[]>([]);
const getChamberOptions = async () => {
  const res = await getChamberAvailableList(0);
  chamberOptions.value = res.data;
};
getChamberOptions();

const freezeOptions = ref([
  {
    label: "正常",
    value: false,
    tagType: "success"
  },
  {
    label: "冻结",
    value: true,
    tagType: "danger"
  }
]);
const keyOptions = ref<DictOptions[]>([
  {
    label: "未领取",
    value: 1,
    tagType: "success"
  },
  {
    label: "已领取",
    value: 2,
    tagType: "danger"
  },
  {
    label: "已归还",
    value: 3,
    tagType: "warning"
  }
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
const columns = reactive<ColumnProps<CoupleRoom.ResRoomOrder>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "no", label: "订单号", width: 120 },
  {
    prop: "areaType",
    label: "区域",
    enum: coupleRoomArea,
    tag: true,
    search: { el: "select", props: { filterable: true } }
  },
  {
    prop: "startTime",
    label: "入住日期",
    search: { el: "date-picker", props: { type: "daterange", valueFormat: "YYYY-MM-DD" } },
    render(scope) {
      return dayjs(scope.row.startTime).format("YYYY-MM-DD");
    }
  },
  {
    prop: "endTime",
    label: "退房日期",
    search: { el: "date-picker", props: { type: "daterange", valueFormat: "YYYY-MM-DD" } },
    render(scope) {
      return dayjs(scope.row.endTime).format("YYYY-MM-DD");
    }
  },
  { prop: "chamberName", label: "房间号", search: { el: "input" } },
  { prop: "nick", label: "账号", width: 120, search: { el: "input" } },
  { prop: "name", label: "申请人", search: { el: "input" } },
  { prop: "day", label: "入住天数", width: 80 },
  { prop: "remark", label: "备注", width: 150 },
  {
    prop: "status",
    label: "订单状态",
    tag: true,
    enum: orderStatus,
    width: 100,
    search: { el: "select", props: { filterable: true } }
  },
  { prop: "freeze", label: "冻结", enum: freezeOptions, tag: true, search: { el: "select", props: { filterable: true } } },
  { prop: "keychain", label: "钥匙", enum: keyOptions, tag: true },
  { prop: "createTime", label: "创建时间", width: 160 },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

const changeKey = async (row: CoupleRoom.ResRoomOrder) => {
  if (row.keychain === 1) {
    await useHandleData(editCoupleRoomOrder, { keychain: 2, id: row.id }, "确认领取钥匙");
  } else if (row.keychain === 2) {
    await useHandleData(editCoupleRoomOrder, { keychain: 3, id: row.id }, "确认归还钥匙");
  } else {
    return;
  }
  proTable.value?.getTableList();
};

const freezeCoupleRoomOrderHandler = async (row: CoupleRoom.ResRoomOrder) => {
  await useHandleData(
    freezeCoupleRoomOrder,
    { freeze: row.freeze ? 0 : 1, id: row.id, chamberName: row.chamberName },
    "确认冻结"
  );
  proTable.value?.getTableList();
};

const unfreezeDialogVisible = ref(false);
const unfreezeForm = ref({
  chamberName: "",
  id: 0,
  keychain: 2,
  value1: ["", ""],
  freeze: false,
  startTime: "",
  endTime: ""
});
const handleUnfreezeSubmit = async () => {
  unfreezeForm.value.startTime = unfreezeForm.value.value1[0];
  unfreezeForm.value.endTime = unfreezeForm.value.value1[1];
  await freezeCoupleRoomOrder(unfreezeForm.value);
  unfreezeDialogVisible.value = false;
  proTable.value?.getTableList();
};

const unfreezeDialogHandler = (row: CoupleRoom.ResRoomOrder) => {
  unfreezeDialogVisible.value = true;
  unfreezeForm.value.id = row.id;
  unfreezeForm.value.chamberName = row.chamberName;
  unfreezeForm.value.value1 = [dayjs(row.startTime).format("YYYY-MM-DD"), dayjs(row.endTime).format("YYYY-MM-DD")];
};

const handleChamberChange = (value: string) => {
  let chamber = chamberOptions.value.find(chamber => chamber.name === value);
  unfreezeForm.value.value1 = [dayjs(chamber?.startTime).format("YYYY-MM-DD"), dayjs(chamber?.endTime).format("YYYY-MM-DD")];
};

// 审核
const auditDialogVisible = ref(false);
const auditForm = ref({
  id: 0,
  orderId: 0,
  name: username.value,
  status: 1,
  content: ""
});
const auditRow = ref<CoupleRoom.ResRoomOrder>();

const auditDialogHandler = (row: CoupleRoom.ResRoomOrder) => {
  auditDialogVisible.value = true;
  auditForm.value.orderId = row.id;
  auditRow.value = row;
};

const handleAuditSubmit = async () => {
  if (!(auditForm.value.status === 2 && auditForm.value.content === "")) {
    await auditCoupleRoomOrder(auditForm.value);
    auditDialogVisible.value = false;
    ElMessage.success("审核成功");
    if (auditRow.value?.nick) {
      // 获取用户详情
      const res = await getUserInfoByUsername(auditRow.value?.nick);
      if (res.msg) {
        let title = auditForm.value.status === 1 ? "您的客房订单已审核通过" : "您的客房订单已审核拒绝";
        let body = auditRow.value.chamberName + (auditForm.value.status === 1 ? "请注意及时入住" : ":" + auditForm.value.content);
        sendMessage({
          title: title,
          body: body,
          type: "1",
          payload: ``,
          userName: auditRow.value?.nick,
          equipmentToken: res.msg
        });
      }
    }
    proTable.value?.getTableList();
  } else {
    ElMessage.error("请填写理由");
  }
};

const exportHandler = async () => {
  let newParams = JSON.parse(JSON.stringify(proTable.value?.searchParam));
  if (newParams.startTime) {
    newParams.beginStartTime = newParams.startTime[0];
    newParams.endStartTime = newParams.startTime[1];
    delete newParams.startTime;
  }
  if (newParams.endTime) {
    newParams.beginEndTime = newParams.endTime[0];
    newParams.endEndTime = newParams.endTime[1];
    delete newParams.endTime;
  }
  await useDownload(`${baseUrl}/coupleRoom/room/order/export`, "客房订单", true, ".xlsx", "post", newParams);
};

// 退款
const refundHandler = async (row: CoupleRoom.ResRoomOrder) => {
  await useHandleData(refundCoupleRoomOrder, row.id, "确认退款");
  proTable.value?.getTableList();
};

const orderDrawerRef = ref<InstanceType<typeof CoupleRoomOrderDrawer>>();
const openDrawer = async (title: string, row: CoupleRoom.ResRoomOrder) => {
  const res = await getCoupleRoomOrderDetail(row.id);

  orderDrawerRef.value?.acceptParams({
    title,
    rowData: res.data
  });
};
</script>
