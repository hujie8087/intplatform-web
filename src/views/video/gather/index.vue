<template>
  <div class="main-box">
    <div class="table-box">
      <div class="card mb10 pt0 pb0">
        <SelectFilter :data="selectFilterData" :default-values="selectFilterValues" @change="changeSelectFilter" />
      </div>
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getGatherList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" @click="toDetail">新增视频</el-button>
          <el-button type="danger" :disabled="!scope.isSelected" :icon="Delete" @click="batchDelete(scope.selectedListIds)">
            批量删除视频
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="EditPen" @click="toEdit(scope.row)"> 编辑 </el-button>
          <el-button type="primary" link :icon="Delete" @click="deleteGatherHandle(scope.row)">删除</el-button>
        </template>
      </ProTable>
    </div>
    <GatherDrawer ref="drawerRef" />
  </div>
</template>

<script setup lang="tsx" name="Gather">
import { reactive, ref } from "vue";
import { Gather } from "@/api/interface/video";
import { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import ProTable from "@/components/ProTable/index.vue";
import { deleteGather, getGatherList, getVideoLabelList, getVideoTypeList } from "@/api/modules/video";
import { CirclePlus, Delete, EditPen } from "@element-plus/icons-vue";
import { useHandleData } from "@/hooks/useHandleData";
import GatherDrawer from "./components/GatherDrawer.vue";
import SelectFilter from "@/components/SelectFilter/index.vue";
import { DictOptions } from "@/api/interface";
import { useDict } from "@/hooks/useDict";
import { useRouter } from "vue-router";

const router = useRouter();

// const baseUrl = import.meta.env.VITE_API_URL;
// 字典数据
const video_label_type = ref<DictOptions[]>([]);
useDict("video_label_type").then(res => {
  video_label_type.value = res.video_label_type;
});

interface OptionsProps {
  value: string;
  label: string;
  icon?: string;
}

interface SelectDataProps {
  title: string; // 列表标题
  key: string; // 当前筛选项 key 值
  multiple?: boolean; // 是否为多选
  options: OptionsProps[]; // 筛选数据
}

const selectFilterValues = ref();
const selectFilterData = ref<SelectDataProps[]>([]);

const getVideoLabelOptions = async () => {
  const res = await getVideoLabelList({ pageNum: 1, pageSize: 100000 });
  selectFilterData.value = video_label_type.value.map(item => {
    return {
      title: item.label,
      key: "video" + item.value,
      multiple: item.cssClass === "1",
      options: [
        { label: "全部", value: "" },
        ...res.rows
          .filter(label => label.labelType === item.value)
          .map(val => {
            return {
              label: val.labelName,
              value: val.id,
              icon: ""
            };
          })
      ]
    };
  }) as SelectDataProps[];
  selectFilterValues.value = selectFilterData.value.reduce((acc, cur) => {
    acc[cur.key] = [""];
    return acc;
  }, {});
};

// 获取视频分类
const videoTypeList = ref<DictOptions[]>([]);
const getVideoTypeOptions = async () => {
  const res = await getVideoTypeList({ pageNum: 1, pageSize: 100000 });
  videoTypeList.value = res.rows.map(item => {
    return {
      value: item.id,
      label: item.typeName,
      tagType: ""
    } as DictOptions;
  });
};
getVideoTypeOptions();
getVideoLabelOptions();
// 默认 selectFilter 参数
const changeSelectFilter = (value: typeof selectFilterValues.value) => {
  proTable.value!.pageable.pageNum = 1;
  selectFilterValues.value = value;
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
// 表格配置项
const columns = reactive<ColumnProps<Gather.ResGather>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 80 },
  {
    prop: "type",
    label: "视频分类",
    enum: videoTypeList,
    search: { el: "select" }
  },
  { prop: "videoName", label: "视频名称", search: { el: "input", tooltip: "请输入视频名称" } },
  {
    prop: "description",
    label: "视频描述"
  },
  {
    prop: "playVolume",
    label: "视频播放量"
  },
  {
    prop: "score",
    label: "视频评分"
  },
  {
    prop: "scoreNum",
    label: "评分人数"
  },
  {
    prop: "coverPath",
    label: "视频封面",
    render: scope => {
      return (
        <el-image
          style="width: 100px; height: 100px"
          src={scope.row.coverPath}
          zoom-rate={1.2}
          max-scale={7}
          min-scale={0.2}
          preview-src-list={[scope.row.coverPath]}
          initial-index={4}
          fit="cover"
          preview-teleported
        />
      );
    }
  },
  {
    prop: "remark",
    label: "备注",
    width: 180
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);
// 跳转详情页
const toDetail = () => {
  router.push(`/video/create`);
};

const toEdit = (row: Gather.ResGather) => {
  router.push(`/video/edit?id=${row.id}`);
};

// 删除视频信息
const deleteGatherHandle = async (params: Gather.ResGather) => {
  await useHandleData(deleteGather, [params.id], `删除【${params.videoName}】视频`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  console.log(ids);

  await useHandleData(deleteGather, ids, "批量删除视频");
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// // 打开 drawer(新增、查看、编辑)
// const drawerRef = ref<InstanceType<typeof GatherDrawer> | null>(null);
// const openDrawer = async (title: string, row: Partial<Gather.ResGather> = {}) => {
//   const params = {
//     title,
//     isView: title === "查看",
//     rowData: { ...row },
//     api: title === "新增" ? addGather : title === "编辑" ? editGather : undefined,
//     getTableList: proTable.value?.getTableList,
//     videoTypeList: videoTypeList.value,
//     selectFilterData: selectFilterData.value
//   };
//   drawerRef.value?.acceptParams(params);
// };
</script>

<style scoped></style>
