<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getContactList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" v-auth="['system:connect:add']" :icon="CirclePlus" @click="openDrawer('新增')">
            新增
          </el-button>
          <el-button
            type="danger"
            v-auth="['system:connect:remove']"
            :disabled="!scope.isSelected"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" :icon="View" link @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="warning" :icon="Edit" link v-auth="['system:connect:edit']" @click="openDrawer('编辑', scope.row)">
            编辑
          </el-button>
          <el-button type="danger" :icon="Delete" link v-auth="['system:connect:remove']" @click="deleteOtherHandle(scope.row)">
            删除
          </el-button>
        </template>
      </ProTable>
    </div>
    <ContactDrawer ref="drawerRef" />
  </div>
</template>
<script setup lang="tsx" name="Contact">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, Edit, View } from "@element-plus/icons-vue";
import { getContactList, deleteContact, getContactById, addContact, editContact } from "@/api/modules/service/contact";
import { Contact } from "@/api/interface/service/contact";
import { useI18n } from "vue-i18n";
import ContactDrawer from "./components/ContactDrawer.vue";

const { t } = useI18n(); // 解构出t方法
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
const columns = reactive<ColumnProps<Contact.ResContact>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "name", label: "姓名", search: { el: "input" } },
  {
    prop: "tel",
    label: "联系电话",
    search: { el: "input" }
  },
  {
    prop: "email",
    label: "邮箱"
  },
  { prop: "workTime", label: "工作时间" },
  { prop: "details", label: "详情" },
  { prop: "remark", label: "备注" },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除联系人
const deleteOtherHandle = async (params: Contact.ResContact) => {
  await useHandleData(deleteContact, params.id, `删除联系人`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteContact, ids.join(","), t("main.deleteBatchMsg", { title: "联系人" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof ContactDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Contact.ResContact> = {}) => {
  if (row.id) {
    const res = await getContactById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addContact : title === "编辑" ? editContact : undefined,
    getTableList: proTable.value?.getTableList
  };
  drawerRef.value?.acceptParams(params);
};
</script>
