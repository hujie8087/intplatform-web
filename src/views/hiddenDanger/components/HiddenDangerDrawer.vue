<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}隐患详情`">
    <el-descriptions :column="3" border>
      <el-descriptions-item label="隐患名称">{{ drawerProps.rowData.name }}</el-descriptions-item>
      <el-descriptions-item label="发现人">{{ drawerProps.rowData.reportPerson }}</el-descriptions-item>
      <el-descriptions-item label="发现时间">{{ drawerProps.rowData.findTime }}</el-descriptions-item>
      <el-descriptions-item label="联系电话">{{ drawerProps.rowData.tel }}</el-descriptions-item>
      <el-descriptions-item label="上报时间" :span="2">{{ drawerProps.rowData.createTime }}</el-descriptions-item>
      <el-descriptions-item label="隐患地点" :span="3">{{ drawerProps.rowData.location }}</el-descriptions-item>
      <el-descriptions-item label="隐患图片" :span="3">
        <template v-if="drawerProps.rowData.url">
          <el-image
            v-for="url in drawerProps.rowData.url?.split(',')"
            style="width: 100px; height: 100px; margin-right: 10px"
            :key="url"
            :src="`${fileUrl}${url}`"
            :preview-src-list="drawerProps.rowData.url?.split(',').map(item => `${fileUrl}${item}`)"
          />
        </template>
      </el-descriptions-item>
      <el-descriptions-item label="处理人">{{ drawerProps.rowData.handleBy }}</el-descriptions-item>
      <el-descriptions-item label="处理时间">{{ drawerProps.rowData.handleTime }}</el-descriptions-item>
      <el-descriptions-item label="处理进度">
        <el-tag
          :type="
            drawerProps.hiddenDangerStateOptions.find(item => item.value === drawerProps.rowData.progress)?.tagType || 'info'
          "
        >
          {{ drawerProps.hiddenDangerStateOptions.find(item => item.value === drawerProps.rowData.progress)?.label }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="处理结果" :span="3">{{ drawerProps.rowData.handleResult }}</el-descriptions-item>
      <el-descriptions-item label="处理图片" :span="3">
        <el-image
          v-for="url in drawerProps.rowData.handlePhoto?.split(',')"
          style="width: 100px; height: 100px; margin-right: 10px"
          :key="url"
          :src="`${fileUrl}${url}`"
          :preview-src-list="drawerProps.rowData.handlePhoto?.split(',').map(item => `${fileUrl}${item}`)"
        />
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button type="primary" @click="drawerVisible = false">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="HiddenDangerDrawer">
import { ref } from "vue";
import { HiddenDanger } from "@/api/interface/hiddenDanger";
import { DictOptions } from "@/api/interface";

const fileUrl = import.meta.env.VITE_APP_BASE_FILE;

interface DrawerProps {
  title: string;
  rowData: Partial<HiddenDanger.ResHiddenDanger>;
  hiddenDangerStateOptions: DictOptions[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  rowData: {},
  hiddenDangerStateOptions: []
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
