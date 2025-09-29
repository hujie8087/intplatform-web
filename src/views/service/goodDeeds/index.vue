<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getGoodDeedsList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" v-auth="['other:deeds:add']" :icon="CirclePlus" @click="openDrawer('新增')"> 新增 </el-button>
          <!-- 导出 -->
          <el-button type="warning" :icon="Download" v-auth="['other:deeds:export']" @click="exportGoodDeedsExcel">
            导出好人好事
          </el-button>
          <el-button
            type="danger"
            v-auth="['other:deeds:remove']"
            :disabled="!scope.isSelected"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="warning" link v-auth="['other:deeds:edit']" @click="openDrawer('编辑', scope.row)"> 编辑 </el-button>
          <el-button type="success" link v-auth="['other:deeds:review']" @click="openDrawer('审核', scope.row)">审核</el-button>
          <el-button type="danger" link v-auth="['other:deeds:remove']" @click="deleteOtherHandle(scope.row)"> 删除 </el-button>
        </template>
      </ProTable>
    </div>
    <GoodDeedsDrawer ref="drawerRef" />
  </div>
</template>
<script setup lang="tsx" name="GoodDeeds">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, Download } from "@element-plus/icons-vue";
import {
  getGoodDeedsList,
  deleteGoodDeeds,
  getGoodDeedsById,
  addGoodDeeds,
  editGoodDeeds,
  reviewGoodDeeds
} from "@/api/modules/service/goodDeeds";
import { GoodDeeds } from "@/api/interface/service/goodDeeds";
import { useI18n } from "vue-i18n";
import GoodDeedsDrawer from "./components/GoodDeedsDrawer.vue";
import { useDownload } from "@/hooks/useDownload";
import { useDict } from "@/hooks/useDict";
import { DictOptions } from "@/api/interface";

const { t } = useI18n(); // 解构出t方法
const baseUrl = import.meta.env.VITE_API_URL;
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
const goodDeedsStatusOptions = ref<DictOptions[]>([]);
useDict("good_deeds_status").then(res => {
  goodDeedsStatusOptions.value = res.good_deeds_status.map(item => ({
    ...item,
    value: +item.value
  }));
});
// 表格配置项
const columns = reactive<ColumnProps<GoodDeeds.ResGoodDeeds>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "title", label: "标题", search: { el: "input" } },
  {
    prop: "personName",
    label: "好人姓名",
    search: { el: "input" }
  },
  {
    prop: "contactInfo",
    label: "联系方式",
    search: { el: "input" }
  },
  { prop: "status", label: "状态", tag: true, search: { el: "select" }, enum: goodDeedsStatusOptions },
  { prop: "likesCount", label: "点赞数" },
  { prop: "auditUser", label: "审核人", search: { el: "input" } },
  { prop: "auditTime", label: "审核时间" },
  { prop: "createTime", label: "创建时间" },
  { prop: "createBy", label: "创建人" },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除报修记录
const deleteOtherHandle = async (params: GoodDeeds.ResGoodDeeds) => {
  await useHandleData(deleteGoodDeeds, params.id, `删除内容`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteGoodDeeds, ids.join(","), t("main.deleteBatchMsg", { title: "内容" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 导出好人好事
const exportGoodDeedsExcel = () => {
  useDownload(`${baseUrl}other/deeds/export`, "好人好事列表", true, ".xlsx", "post", proTable.value?.searchParam);
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof GoodDeedsDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<GoodDeeds.ResGoodDeeds> = {}) => {
  if (row.id) {
    const res = await getGoodDeedsById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addGoodDeeds : title === "编辑" ? editGoodDeeds : title === "审核" ? reviewGoodDeeds : undefined,
    getTableList: proTable.value?.getTableList,
    goodDeedsStatusOptions: goodDeedsStatusOptions.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
