<template>
  <div class="sample main-box">
    <!-- 样本页面 -->
    <div class="table-box">
      <ProTable
        ref="proTable"
        :init-param="searchParams"
        :columns="columns"
        :request-api="getSampleList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 4, xl: 4 }"
        row-key="postId"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader>
          <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增样本</el-button>
          <el-button type="danger" :icon="Delete" @click="deleteDeptHandle()">批量删除</el-button>
          <el-button type="success" :icon="Upload" @click="openDrawer('新增')">导入</el-button>
          <el-button type="warning" :icon="Download" @click="deleteDeptHandle()">导出</el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <!-- <el-button type="primary" v-auth="['system:dept:add']" link :icon="Plus" @click="openDrawer('新增', scope.row)"
            >新增</el-button
          > -->
          <el-button type="warning" v-auth="['system:dept:edit']" link :icon="EditPen" @click="openDrawer('编辑', scope.row)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            v-auth="['system:dept:remove']"
            v-if="scope.row.deptId !== 100"
            link
            :icon="Delete"
            @click="deleteDeptHandle(scope.row)"
          >
            删除
          </el-button>
        </template>
      </ProTable>
    </div>
  </div>
</template>

<script setup lang="ts" name="sample">
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { CirclePlus, Delete, EditPen, Upload, Download } from "@element-plus/icons-vue";
import { getSampleList } from "@/api/modules/questionnaire/sample";
const proTable = ref();
const columns = reactive([
  { type: "selection", label: "", width: 80 },
  { prop: "employeeNo", label: "用户帐号", search: { el: "input" } },
  { prop: "name", label: "用户姓名", search: { el: "input" } },
  { prop: "createTime", label: "创建时间" },
  { prop: "updateTime", label: "最后更新时间" },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);
const searchParams = reactive({
  // projectKey: "",
  // employeeNo: "",
  // name: "",
  // status: "",
  pageNum: 1,
  pageSize: 20
});
const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total,
    current: data.current,
    size: data.size
  };
};
// 打开 drawer(新增、查看、编辑)
// const drawerRef = ref(null);
const openDrawer = async () => {
  // if (row.deptId) {
  //   const res = await getDeptById(row.deptId);
  //   row = res.data;
  // }
  // if (title === "编辑" && row.deptId) {
  //   const res = await listDeptExcludeChild(row.deptId);
  //   deptOptions.value = handleTree(res.data, "deptId");
  // }
  // if (title === "新增") {
  //   const res = await getDeptList({ pageNum: 1, pageSize: 1000 });
  //   deptOptions.value = handleTree(res.data, "deptId");
  // }
  // const params = {
  //   title,
  //   isView: title === "查看",
  //   rowData: title === "新增" ? { parentId: row.parentId } : row,
  //   api: title === "新增" ? addDept : title === "编辑" ? editDept : undefined,
  //   getTableList: proTable.value?.getTableList,
  //   deptOptions: deptOptions.value
  // };
  // drawerRef.value?.acceptParams(params);
};
// 删除用户信息
const deleteDeptHandle = async () => {
  // await useHandleData(deleteDept, params.deptId, `删除【${params.deptName}】部门`);
  proTable.value?.getTableList();
};

//   const orderIds = proTable.value?.selectedList.filter(item => item.orderNo).map(item => item.oId) ?? [];
</script>

<style scoped lang="scss">
.table-box {
  height: calc(100% - 24px);
  margin: 10px 12px;
}
</style>
