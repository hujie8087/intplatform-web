<template>
  <div class="card main-box">
    <div class="table-box">
      <div>
        <el-form :inline="true" :model="formData" class="demo-form-inline">
          <el-form-item label="查询时间">
            <el-date-picker
              v-model="formData.date"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="datetimerange"
              :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)]"
              placeholder="选择查询时间"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
      <iframe
        :src="`http://192.168.93.190/decision/view/report?viewlet=intplatform%252Frain.cpt&ref_t=design&ref_c=bc80c906-6866-43c2-85ab-6645cdd6ca0c&beginTime=${searchData.date[0]}&endTime=${searchData.date[1]}`"
        frameborder="0"
        width="100%"
        height="100%"
        v-if="isShow"
      ></iframe>
      <div v-else>
        <el-empty description="请选择查询时间" />
      </div>
    </div>
  </div>
</template>

<script setup lang="tsx" name="ReportCouple">
import { ElMessage } from "element-plus";
import { ref } from "vue";
const formData = ref({
  date: []
});

const isShow = ref(false);

const searchData = ref({
  date: []
});

const onSubmit = () => {
  if (!formData.value.date.length) {
    ElMessage.warning("请选择查询月份");
    return;
  }
  searchData.value = {
    date: formData.value.date
  };
  isShow.value = true;
};
</script>
