<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        :columns="columns"
        :request-api="getPostList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 4, xl: 4 }"
        :init-param="{}"
        row-key="postId"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" v-auth="['system:post:add']" :icon="CirclePlus" @click="openDrawer('新增')"
            >新增岗位</el-button
          >
          <el-button
            type="danger"
            v-auth="['system:post:remove']"
            :disabled="!scope.isSelected"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除岗位
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="warning" v-auth="['system:post:edit']" link :icon="EditPen" @click="openDrawer('编辑', scope.row)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            v-auth="['system:post:remove']"
            v-if="scope.row.postId !== 100"
            link
            :icon="Delete"
            @click="deletePostHandle(scope.row)"
          >
            删除
          </el-button>
        </template>
      </ProTable>
    </div>
    <PostDrawer ref="drawerRef" />
  </div>
</template>
<script setup lang="ts" name="postManage">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import PostDrawer from "./components/PostDrawer.vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen } from "@element-plus/icons-vue";
import { getPostList, deletePost, editPost, addPost, getPostById } from "@/api/modules/system/post";
import { Post } from "@/api/interface/system";
import { useI18n } from "vue-i18n";
import { userStatus } from "@/utils/serviceDict";
const { t } = useI18n(); // 解构出t方法

// ProTable 实例
const proTable = ref<ProTableInstance>();

const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total
  };
};
// 表格配置项
const columns = reactive<ColumnProps<Post.ResPost>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "postId", label: "岗位编号" },
  { prop: "postCode", label: "岗位编码", search: { el: "input" }, align: "center" },
  { prop: "postName", label: "岗位名称", search: { el: "input" }, align: "center" },
  { prop: "postSort", label: "排序", width: 120 },
  {
    prop: "status",
    label: "状态",
    width: 120,
    sortable: true,
    tag: true,
    enum: userStatus,
    search: { el: "select" }
  },
  { prop: "createTime", label: "创建时间", width: 180 },
  { prop: "operation", label: "操作", width: 330, fixed: "right" }
]);
const postOptions = ref<Post.ResPost[]>([]);
// 删除用户信息
const deletePostHandle = async (params: Post.ResPost) => {
  await useHandleData(deletePost, params.postId, `删除【${params.postName}】岗位`);
  proTable.value?.getTableList();
};

// 批量删除岗位信息
const batchDelete = async (ids: number[]) => {
  await useHandleData(deletePost, ids, t("main.deleteBatchMsg", { title: t("system.post.post") }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};
// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof PostDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Post.ResPost> = {}) => {
  if (row.postId) {
    const res = await getPostById(row.postId);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addPost : title === "编辑" ? editPost : undefined,
    getTableList: proTable.value?.getTableList,
    postOptions: postOptions.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
