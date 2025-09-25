<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getBookList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" v-auth="['other:books:add']" :icon="CirclePlus" @click="openDrawer('新增')"> 新增 </el-button>
          <!-- 导入 -->
          <el-button type="success" :icon="Upload" v-auth="['other:books:import']" @click="importBookExcel"> 导入图书 </el-button>
          <!-- 导出 -->
          <el-button type="warning" :icon="Download" v-auth="['other:books:export']" @click="exportBookExcel">
            导出图书
          </el-button>
          <el-button
            type="danger"
            v-auth="['other:books:remove']"
            :disabled="!scope.isSelected"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="warning" link :icon="Edit" v-auth="['other:books:edit']" @click="openDrawer('编辑', scope.row)">
            编辑
          </el-button>
          <el-button type="danger" link :icon="Delete" v-auth="['other:books:remove']" @click="deleteOtherHandle(scope.row)">
            删除
          </el-button>
        </template>
      </ProTable>
    </div>
    <BooksDrawer ref="drawerRef" />
    <ImportExcel ref="dialogRef" />
  </div>
</template>
<script setup lang="tsx" name="Book">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, Download, Edit, Upload, View } from "@element-plus/icons-vue";
import { getBookList, deleteBook, getBookById, addBook, editBook, importBook } from "@/api/modules/service/book";
import { Book } from "@/api/interface/service/book";
import { useI18n } from "vue-i18n";
import BooksDrawer from "./components/BooksDrawer.vue";
import ImportExcel from "@/components/ImportExcel/index.vue";
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
const bookAddressOptions = ref<DictOptions[]>([]);
useDict("book_address").then(res => {
  bookAddressOptions.value = res.book_address;
});
// 表格配置项
const columns = reactive<ColumnProps<Book.ResBook>[]>([
  { type: "selection", fixed: "left", width: 50 },
  {
    prop: "code",
    label: "条形码",
    search: { el: "input" }
  },
  {
    prop: "bookName",
    label: "图书名称",
    search: { el: "input" },
    width: 120
  },
  { prop: "bookNo", label: "标准书号", search: { el: "input" }, width: 120 },
  { prop: "author", label: "作者", search: { el: "input" } },
  { prop: "publisher", label: "出版社", search: { el: "input" } },
  { prop: "publicationDate", label: "出版年月" },
  { prop: "edition", label: "版本" },
  { prop: "size", label: "尺寸" },
  { prop: "discountedPrice", label: "折扣价", width: 60 },
  { prop: "originalPrice", label: "原价", width: 60 },
  { prop: "museumDate", label: "馆藏日期", width: 100 },
  { prop: "typeNo", label: "类型编号", width: 120 },
  { prop: "rcode", label: "馆藏地点", tag: true, enum: bookAddressOptions, search: { el: "select" }, width: 120 },
  { prop: "batch", label: "批次", width: 80 },
  {
    prop: "remark",
    label: "备注"
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除报修记录
const deleteOtherHandle = async (params: Book.ResBook) => {
  await useHandleData(deleteBook, params.id, `删除内容`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteBook, ids.join(","), t("main.deleteBatchMsg", { title: "内容" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 导入图书
const dialogRef = ref<InstanceType<typeof ImportExcel> | null>(null);
const importBookExcel = () => {
  dialogRef.value?.acceptParams({
    title: "图书",
    importApi: importBook,
    tempApi: `${baseUrl}/other/books/importTemplate`,
    getTableList: proTable.value?.getTableList
  });
};

// 导出图书
const exportBookExcel = () => {
  useDownload(`${baseUrl}other/books/export`, "图书列表", true, ".xlsx", "post", proTable.value?.searchParam);
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof BooksDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Book.ResBook> = {}) => {
  if (row.id) {
    const res = await getBookById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addBook : title === "编辑" ? editBook : undefined,
    getTableList: proTable.value?.getTableList,
    bookAddressOptions: bookAddressOptions.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
