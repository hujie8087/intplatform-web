<template>
  <div class="main">
    <!-- <el-form ref="formRef" :inline="true" :model="form" class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]">
      <el-form-item label="报警地点：" prop="reportLocation">
        <el-input v-model="form.reportLocation" placeholder="请输入报警地点" clearable class="!w-[180px]" />
      </el-form-item>
      <el-form-item label="报警人：" prop="reportBy">
        <el-input v-model="form.reportBy" placeholder="请输入报警人" clearable class="!w-[180px]" />
      </el-form-item>
      <el-form-item label="级别：" prop="level">
        <el-select v-model="form.level" placeholder="请选择级别" clearable class="!w-[180px]">
          <el-option label="低" value="0" />
          <el-option label="中" value="1" />
          <el-option label="高" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="useRenderIcon(Search)" :loading="loading" @click="onSearch"> 搜索 </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)"> 重置 </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="事故告警记录" :columns="columns" @refresh="onSearch">
      <template #default="{ size, dynamicColumns }">
        <pure-table
          adaptive
          :adaptive-config="{ offsetBottom: 108 }"
          align-whole="center"
          show-overflow-tooltip
          table-layout="auto"
          :loading="loading"
          :size="size"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="pagination"
          :pagination-small="size === 'small' ? true : false"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        ></pure-table>
      </template>
    </PureTableBar> -->
  </div>
</template>

<script setup lang="ts" name="AccidentRecords">
// import { ref } from "vue";
// import { useRenderIcon } from "@/components/ReIcon/src/hooks";
// import { PureTableBar } from "@/components/RePureTableBar";
// import { useAccidentRecords } from "./utils/hook";
// import Search from "@iconify-icons/ep/search";
// import Refresh from "@iconify-icons/ep/refresh";

// const formRef = ref();

// const { form, loading, columns, dataList, pagination, onSearch, resetForm, handleSizeChange, handleCurrentChange } =
//   useAccidentRecords();
</script>
