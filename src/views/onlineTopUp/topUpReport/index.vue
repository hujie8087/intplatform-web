<template>
  <div class="card main-box">
    <div class="table-box">
      <div>
        <el-form :inline="true" :model="formData" class="demo-form-inline">
          <el-form-item label="查询月份">
            <el-date-picker
              v-model="formData.yearMonth"
              format="YYYY-MM"
              value-format="YYYY-MM"
              type="month"
              placeholder="选择查询月份"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
      <iframe
        :src="`http://192.168.93.190/decision/view/report?viewlet=intplatform%252Frain.cpt&ref_t=design&ref_c=bc80c906-6866-43c2-85ab-6645cdd6ca0c&yearMonth=${searchData.yearMonth}`"
        frameborder="0"
        width="100%"
        height="100%"
        v-if="isShow"
      ></iframe>
      <div v-else>
        <el-empty description="请选择查询月份" />
      </div>
    </div>
  </div>
</template>

<script setup lang="tsx" name="ReportCouple">
import { ElMessage } from "element-plus";
import { ref } from "vue";
const formData = ref({
  yearMonth: ""
});

const isShow = ref(false);

const searchData = ref({
  yearMonth: ""
});

const onSubmit = () => {
  if (!formData.value.yearMonth) {
    ElMessage.warning("请选择查询月份");
    return;
  }
  searchData.value = {
    yearMonth: formData.value.yearMonth
  };
  isShow.value = true;
};
</script>
