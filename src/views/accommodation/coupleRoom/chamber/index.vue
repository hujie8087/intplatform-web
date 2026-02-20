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
        <template #tableHeader="{ selectedListIds }">
          <el-button type="primary" @click="handleAdd">新增</el-button>
          <!-- 导入 -->
          <el-button type="success" @click="handleBatchAdd">批量新增</el-button>
          <el-button
            type="danger"
            v-auth="['room:chamber:remove']"
            :disabled="!selectedListIds || selectedListIds.length === 0"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
          <!-- 导出 -->
          <el-button type="warning" v-auth="['room:chamber:export']" @click="handleExport">导出</el-button>
        </template>
        <template #operation="scope">
          <el-button type="primary" link v-auth="['room:chamber:edit']" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" link v-auth="['room:chamber:remove']" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </ProTable>
    </div>
    <ChamberDrawer ref="drawerRef" />
  </div>
</template>
<script setup lang="tsx" name="AccommodationChamber">
import { ref, computed } from "vue";
import ChamberDrawer from "./components/ChamberDrawer.vue";
import dayjs from "dayjs";
import { addChamber, batchAddChamber, deleteChamber, editChamber, getChamberList } from "@/api/modules/service/coupleRoom";
import { CoupleRoom } from "@/api/interface/service/coupleRoom";
import { DictOptions } from "@/api/interface";
import { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import ProTable from "@/components/ProTable/index.vue";
import { ElMessage } from "element-plus";
import { useDict } from "@/hooks/useDict";
import { useHandleData } from "@/hooks/useHandleData";
import { useDownload } from "@/hooks/useDownload";
const proTable = ref<ProTableInstance>();

const baseUrl = import.meta.env.VITE_API_URL;
const drawerRef = ref<InstanceType<typeof ChamberDrawer>>();
// 字典数据
const coupleRoomArea = ref<DictOptions[]>([]);
useDict("couple_room_area").then(res => {
  coupleRoomArea.value = res.couple_room_area.map(item => ({
    ...item,
    value: +item.value
  }));
});
const dataCallback = (data: any) => {
  console.log(data);
  return {
    list: data.rows,
    total: data.total
  };
};
// 最近14天
const nextWeekDates = ref<string[]>([]);
const getNextWeekDates = () => {
  for (let i = 0; i < 14; i++) {
    nextWeekDates.value.push(dayjs().add(i, "day").format("YYYY-MM-DD"));
  }
};
getNextWeekDates();

const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  if (newParams.startTime) {
    newParams.start = newParams.startTime[0];
    newParams.end = newParams.startTime[1];
    delete newParams.startTime;
  }
  return getChamberList(newParams);
};
// 性能优化：缓存房间状态
const roomStatusCache = computed(() => {
  const cache = new Map<string, Map<string, string>>();
  return cache;
});

const statusOptions = ref<DictOptions[]>([
  {
    label: "启用",
    value: 1,
    tagType: "success"
  },
  {
    label: "停用",
    value: 0,
    tagType: "warning"
  }
]);

const columns = ref<ColumnProps[]>([
  {
    type: "selection",
    width: 55
  },
  {
    prop: "name",
    label: "房号",
    width: 80,
    search: {
      el: "input",
      props: {
        placeholder: "请输入房号"
      }
    }
  },
  {
    prop: "areaType",
    label: "所属区域",
    tag: true,
    width: 100,
    enum: coupleRoomArea,
    search: {
      el: "select",
      props: {
        filterable: true
      }
    }
  },
  ...nextWeekDates.value.map(date => ({
    prop: date,
    label: date,
    render: (scope: any) => {
      const row = scope.row;
      const status = getRoomStatus(row, date);

      // 根据状态确定样式类名
      let statusClass = "room-bg";
      if (status === "已发放") statusClass += " bg-success";
      else if (status === "待发放") statusClass += " bg-warning";
      else if (status === "待审核") statusClass += " bg-info";
      else if (status === "空房") statusClass += " bg-danger";
      else if (status === "停用") statusClass += " bg-disabled";

      return <div class={statusClass}>{status}</div>;
    }
  })),
  {
    prop: "status",
    label: "状态",
    isShow: false,
    enum: statusOptions.value,
    search: {
      el: "select",
      props: {
        filterable: true
      }
    }
  },
  {
    prop: "startTime",
    label: "开始日期",
    isShow: false,
    search: {
      el: "date-picker",
      span: 2,
      props: {
        type: "daterange",
        rangeSeparator: "至",
        startPlaceholder: "开始日期",
        endPlaceholder: "结束日期"
      }
    }
  },
  {
    prop: "operation",
    label: "操作",
    width: 120
  }
]);

// 获取房间状态
const getRoomStatus = (row: CoupleRoom.ResRoom, date: string) => {
  // 检查缓存
  const cacheKey = `${row.name}_${date}`;
  if (roomStatusCache.value.has(cacheKey)) {
    return roomStatusCache.value.get(cacheKey)!.get(date) || "空房";
  }

  // 格式化传入的日期
  let formattedDate = dayjs(date).format("YYYY-MM-DD");
  let lastTime = dayjs(row.lastTime).format("YYYY-MM-DD");
  // 遍历订单数组，根据 keychain 值来判断状态
  if (row.roomOrders && Array.isArray(row.roomOrders)) {
    // 筛选出状态为1和10的订单，因为这两个状态的订单是已提交的订单
    const foundOrder = row.roomOrders
      .filter(order => order.status === 1 || order.status === 10)
      .find(order => {
        let startDate = dayjs(order.startTime).format("YYYY-MM-DD");
        let endDate = dayjs(order.endTime).format("YYYY-MM-DD");
        // 检查订单时间范围和当前日期
        return formattedDate >= startDate && formattedDate < endDate;
      });
    console.log(foundOrder);
    if (foundOrder) {
      if (foundOrder.status === 1) {
        return "待审核";
      } else if (foundOrder.keychain === 1) {
        return "待发放";
      } else if (foundOrder.keychain === 2) {
        return "已发放";
      }
    }
  }
  // 如果日期超出 lastTime，则显示空房
  if (row.status === 0) {
    return "停用";
  } else if (formattedDate > lastTime) {
    return "空房";
  }

  return "空房";
};

// 编辑
const handleEdit = (row: CoupleRoom.ResRoom) => {
  drawerRef.value?.acceptParams({
    title: "编辑房间",
    rowData: { ...row },
    api: editChamber,
    getTableList: proTable.value?.getTableList,
    coupleRoomArea: coupleRoomArea.value
  });
};

// 删除
const handleDelete = async (row: CoupleRoom.ResRoom) => {
  await useHandleData(deleteChamber, row.id, `删除客房`);
  proTable.value?.getTableList();
};

// 批量删除
const handleBatchDelete = async () => {
  const selectedList = proTable.value?.selectedListIds;

  console.log("selectedList---", selectedList);

  if (!selectedList) {
    ElMessage.warning("请选择要删除的客房");
    return;
  }
  await useHandleData(deleteChamber, selectedList.join(","), `删除客房`);
  proTable.value?.getTableList();
};
// 新增
const handleAdd = () => {
  drawerRef.value?.acceptParams({
    title: "新增房间",
    rowData: {},
    api: addChamber,
    getTableList: proTable.value?.getTableList,
    coupleRoomArea: coupleRoomArea.value
  });
};

// 批量新增
const handleBatchAdd = () => {
  drawerRef.value?.acceptParams({
    title: "批量新增",
    rowData: { roomRange: "" },
    api: batchAddChamber,
    getTableList: proTable.value?.getTableList,
    coupleRoomArea: coupleRoomArea.value,
    isBatchAdd: true
  });
};

// 导出
const handleExport = () => {
  useDownload(`${baseUrl}/coupleRoom/room/chamber/export`, "客房租赁房间", true, ".xlsx", "post", {});
};
</script>
<style lang="scss" scoped>
:deep(.room-bg) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 50px;
  margin: 0 auto;
  font-size: 12px;
  font-weight: 700;
  color: rgb(255 255 255);
  text-align: center;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  &:hover {
    box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
    transform: scale(1.05);
  }
}
:deep(.bg-success) {
  background: linear-gradient(135deg, #67c23a, #85ce61);
}
:deep(.bg-danger) {
  background: linear-gradient(135deg, #f56c6c, #f78989);
}
:deep(.bg-warning) {
  background: linear-gradient(135deg, #e6a23c, #ebb563);
}
:deep(.bg-disabled) {
  background: linear-gradient(135deg, #909399, #a6a9ad);
}
:deep(.bg-info) {
  background: linear-gradient(135deg, #409eff, #66b1ff);
}
</style>
