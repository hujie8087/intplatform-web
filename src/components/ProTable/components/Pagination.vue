<template>
  <!-- 分页组件 -->
  <el-pagination
    :background="true"
    :current-page="pageable.pageNum"
    :page-size="pageable.pageSize"
    :page-sizes="pageSize"
    :total="pageable.total"
    layout="total, sizes, prev, pager, next, jumper"
    :small="assemblySize === 'small'"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  ></el-pagination>
</template>

<script setup lang="ts" name="Pagination">
import { computed } from "vue";
import { useGlobalStore } from "@/stores/modules/global";
const globalStore = useGlobalStore();
interface Pageable {
  pageNum: number;
  pageSize: number;
  total: number;
}

interface PaginationProps {
  pageable: Pageable;
  pageSize: number[];
  handleSizeChange: (size: number) => void;
  handleCurrentChange: (currentPage: number) => void;
}
const assemblySize = computed(() => globalStore.assemblySize);
defineProps<PaginationProps>();
</script>
