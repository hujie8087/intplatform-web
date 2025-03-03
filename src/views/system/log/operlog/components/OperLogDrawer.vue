<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="1080" title="操作日志详情">
    <el-descriptions class="margin-top" :column="3" border>
      <el-descriptions-item label="操作模块">
        {{ drawerProps.rowData.title }}
      </el-descriptions-item>
      <el-descriptions-item label="请求地址">
        {{ drawerProps.rowData.operUrl }}
      </el-descriptions-item>
      <el-descriptions-item label="登录信息">
        {{ drawerProps.rowData.operName }}/ {{ drawerProps.rowData.operIp }}/ {{ drawerProps.rowData.operLocation }}
      </el-descriptions-item>
      <el-descriptions-item label="请求方式">
        {{ drawerProps.rowData.requestMethod }}
      </el-descriptions-item>
      <el-descriptions-item label="操作方法" :span="3">
        {{ drawerProps.rowData.method }}
      </el-descriptions-item>
      <el-descriptions-item label="请求参数" :span="3">
        <el-popover trigger="hover" placement="top-start">
          <template #reference>
            <el-link type="primary">查看</el-link>
          </template>
          <pre>{{ drawerProps.rowData.operParam }}</pre>
        </el-popover>
      </el-descriptions-item>
      <el-descriptions-item label="返回参数" :span="3">
        <el-popover trigger="hover" placement="top-start">
          <template #reference>
            <el-link type="primary">查看</el-link>
          </template>
          <pre>{{ drawerProps.rowData.jsonResult }}</pre>
        </el-popover>
      </el-descriptions-item>
      <el-descriptions-item label="操作状态">
        {{ drawerProps.rowData.status }}
      </el-descriptions-item>
      <el-descriptions-item label="消耗时间"> {{ drawerProps.rowData.costTime }}ms </el-descriptions-item>
      <el-descriptions-item label="操作时间">
        {{ drawerProps.rowData.operTime }}
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="drawerVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="OperaLogDrawer">
import { ref } from "vue";
import { OperaLog } from "@/api/interface/system";

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<OperaLog.ResOperaLog>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  rowData: {}
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

defineExpose({
  acceptParams
});
</script>
