import dayjs from "dayjs";
import { message } from "@/utils/message";
import type { PaginationProps } from "@pureadmin/table";
import { reactive, ref, onMounted, toRaw } from "vue";
import { listAlarm } from "@/api/sos-alarm";

export function useAccidentRecords() {
  const form = reactive({
    pageNum: 1,
    pageSize: 10,
    reportLocation: "",
    reportBy: "",
    level: ""
  });

  const dataList = ref([]);
  const loading = ref(true);

  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const columns = [
    {
      label: "报警人",
      prop: "reportBy",
      width: 120
    },
    {
      label: "报警时间",
      prop: "reportTime",
      width: 120,
      formatter: ({ reportTime }) => (reportTime ? dayjs(reportTime).format("YYYY-MM-DD HH:mm:ss") : "--")
    },
    {
      label: "接警工号",
      prop: "receiverJobNumber",
      width: 120
    },
    {
      label: "接警姓名",
      prop: "receiverName",
      width: 120
    },
    {
      label: "联系电话",
      prop: "tel",
      width: 120
    },
    {
      label: "级别",
      prop: "level",
      width: 80
    },
    {
      label: "报警图片",
      prop: "alarmImage",
      width: 100
    },
    {
      label: "报警详情",
      prop: "reportDescription",
      minWidth: 200
    },
    {
      label: "处理时间",
      prop: "processingTime",
      width: 120,
      formatter: ({ processingTime }) => (processingTime ? dayjs(processingTime).format("YYYY-MM-DD HH:mm:ss") : "--")
    },
    {
      label: "处理结果",
      prop: "processingResult",
      minWidth: 150
    },
    {
      label: "报警地点",
      prop: "reportLocation",
      width: 120
    }
  ];

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    form.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    form.pageNum = val;
    onSearch();
  }

  async function onSearch() {
    loading.value = true;
    try {
      const data: any = await listAlarm(toRaw(form));
      dataList.value = data.rows;
      pagination.total = parseInt(data.total);
    } catch (error) {
      message("查询失败", { type: "error" });
    } finally {
      loading.value = false;
    }
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    pagination,
    onSearch,
    resetForm,
    handleSizeChange,
    handleCurrentChange
  };
}
