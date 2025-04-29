<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getRecommendList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" v-auth="['food:recommend:add']" @click="openDrawer('新增')">新增</el-button>
          <el-button
            type="danger"
            :disabled="!scope.isSelected"
            v-auth="['food:recommend:remove']"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="warning" link v-auth="['food:recommend:edit']" :icon="Edit" @click="openDrawer('编辑', scope.row)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            link
            v-auth="['food:recommend:remove']"
            :icon="Delete"
            @click="deleteRecommendHandle(scope.row)"
          >
            删除
          </el-button>
        </template>
      </ProTable>
    </div>
    <RecommendDrawer ref="drawerRef" />
  </div>
</template>
<script setup lang="tsx" name="Recommend">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import RecommendDrawer from "./components/RecommendDrawer.vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Delete, Edit, View } from "@element-plus/icons-vue";
import {
  getRecommendList,
  addRecommend,
  editRecommend,
  getRecommendById,
  deleteRecommend
} from "@/api/modules/productDisplay/recommend";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import { Recommend } from "@/api/interface/productDisplay/recommend";
import { getCanteenListOptions } from "@/api/modules/productDisplay/marketCanteen";
import dayjs from "dayjs";
import { useAuthButtons } from "@/hooks/useAuthButtons";

const { t } = useI18n(); // 解构出t方法
const filePath = import.meta.env.VITE_APP_BASE_FILE;

const { BUTTONS } = useAuthButtons();

const statusOptions = ref<DictOptions[]>([
  { label: "显示", value: "0" },
  { label: "隐藏", value: "1" }
]);

// 所属餐厅
const canteenOptions = ref<DictOptions[]>([]);
const getCanteenList = async () => {
  const res = await getCanteenListOptions();
  canteenOptions.value = res.data.map(item => ({ label: item.name, value: item.id }));
};
getCanteenList();

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
const columns = reactive<ColumnProps<Recommend.ResRecommend>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "rdId", label: "序号", width: 80 },
  {
    prop: "photoUrl",
    label: "图片",
    width: 100,
    render: scope => {
      return (
        <el-image
          style="width: 35px; height: 35px"
          src={filePath + scope.row.photoUrl}
          zoom-rate={1.2}
          max-scale={7}
          min-scale={0.2}
          preview-src-list={filePath + scope.row.photoUrl}
          initial-index={4}
          fit="cover"
          preview-teleported
        />
      );
    }
  },
  { prop: "foodName", label: "菜名", width: 150, search: { el: "input" } },
  {
    prop: "rdLocation",
    label: "推荐地点",
    width: 180,
    render: scope => {
      return (
        <div>
          {scope.row.rdLocation.split(",").map((item, index) => {
            return (
              <div key={index}>
                <el-tag type="success" key={index}>
                  {canteenOptions.value.find(option => option.value == item)?.label}
                </el-tag>
              </div>
            );
          })}
        </div>
      );
    },
    search: {
      el: "select",
      props: {
        multiple: true,
        clearable: true
      }
    }
  },
  {
    prop: "rdDate",
    label: "推荐日期",
    width: 100,
    search: { el: "date-picker" },
    render: scope => {
      return dayjs(scope.row.rdDate).format("YYYY-MM-DD");
    }
  },
  {
    prop: "rdTime",
    label: "推荐时间",
    width: 100
  },
  { prop: "recommendedBy", label: "推荐人", width: 100 },
  { prop: "rdReason", label: "推荐理由" },
  {
    prop: "status",
    label: "状态",
    width: 100,
    enum: statusOptions.value,
    tag: true,
    search: { el: "select" },
    render: scope => {
      return (
        <span>
          {BUTTONS.value["*:*:*"] || BUTTONS.value["food:recommend:edit"] ? (
            <el-switch
              model-value={scope.row.status}
              active-text={scope.row.status === "0" ? "显示" : "隐藏"}
              active-value={"0"}
              inactive-value={"1"}
              onClick={() => changeStatus(scope.row)}
            />
          ) : (
            <el-tag type={scope.row.status === "0" ? "success" : "danger"}>{scope.row.status === "0" ? "显示" : "隐藏"}</el-tag>
          )}
        </span>
      );
    }
  },
  { prop: "remark", label: "备注" },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除反馈
const deleteRecommendHandle = async (params: Recommend.ResRecommend) => {
  await useHandleData(deleteRecommend, params.rdId, `删除【${params.foodName}】菜品`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteRecommend, ids, t("main.deleteBatchMsg", { title: "推荐菜品" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 状态切换
const changeStatus = async (row: Recommend.ResRecommend) => {
  await useHandleData(
    editRecommend,
    { rdId: row.rdId, status: row.status === "0" ? "1" : "0" },
    `修改【${row.foodName}】菜品状态`
  );
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof RecommendDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Recommend.ResRecommend> = {}) => {
  if (row.rdId) {
    const res = await getRecommendById(row.rdId);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addRecommend : title === "编辑" ? editRecommend : undefined,
    getTableList: proTable.value?.getTableList,
    canteenOptions: canteenOptions.value,
    statusOptions: statusOptions.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
