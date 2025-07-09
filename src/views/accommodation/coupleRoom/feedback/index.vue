<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getCoupleRoomFeedbackList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        :init-param="{ pageSize: 15 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader>
          <!-- 导出 -->
          <el-button type="warning" :icon="Download" @click="exportExcel">导出</el-button>
        </template>
      </ProTable>
    </div>
  </div>
</template>
<script setup lang="tsx" name="CoupleRoomFeedback">
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Download } from "@element-plus/icons-vue";
import { getCoupleRoomFeedbackList } from "@/api/modules/service/coupleRoom";
import { DictOptions } from "@/api/interface";
import { CoupleRoom } from "@/api/interface/service/coupleRoom";
import { ElMessageBox } from "element-plus";
import { useDownload } from "@/hooks/useDownload";

const baseUrl = import.meta.env.VITE_API_URL;

// 字典数据
const feedbackTypeOptions = ref<DictOptions[]>([
  {
    label: "房间问题",
    value: "房间问题",
    tagType: "warning"
  },
  {
    label: "系统问题",
    value: "系统问题",
    tagType: "danger"
  },
  {
    label: "其他",
    value: "其他",
    tagType: "info"
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
const columns = reactive<ColumnProps<CoupleRoom.ResFeedback>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "type", label: "类型", tag: true, enum: feedbackTypeOptions, search: { el: "select" } },
  { prop: "content", label: "内容" },
  { prop: "createTime", label: "创建时间" }
]);

// 导出
const exportExcel = async () => {
  ElMessageBox.confirm("确认导出我想吃的数据?", "温馨提示", { type: "warning" }).then(() =>
    useDownload(`${baseUrl}/other/ComplaintMessage/export`, "我想吃的数据", true, ".xlsx", "post", { typeId: 1 })
  );
};
</script>
