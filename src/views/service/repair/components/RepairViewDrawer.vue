<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}报修单`">
    <el-descriptions class="margin-top" :column="3" border>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">报修区域</div>
        </template>
        {{ drawerProps.rowData.repairArea }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">报修房间</div>
        </template>
        {{ drawerProps.rowData.roomNo ?? "--" }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">报修人</div>
        </template>
        {{ drawerProps.rowData.repairPerson ?? "--" }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">联系电话</div>
        </template>
        {{ drawerProps.rowData.tel ?? "--" }}
      </el-descriptions-item>
      <el-descriptions-item :span="2">
        <template #label>
          <div class="cell-item">报修信息</div>
        </template>
        {{ drawerProps.rowData.repairMessage }}
      </el-descriptions-item>
      <el-descriptions-item :span="3">
        <template #label>
          <div class="cell-item">报修图片</div>
        </template>
        <div v-if="drawerProps.rowData.repairPhoto">
          <el-image
            v-for="img in drawerProps.rowData.repairPhoto?.split(',')"
            :key="img"
            style="width: 100px; height: 100px"
            :src="filePath + img"
            :zoom-rate="1.2"
            :max-scale="7"
            :min-scale="0.2"
            :preview-src-list="drawerProps.rowData.repairPhoto?.split(',').map(item => filePath + item)"
            fit="cover"
          />
        </div>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">分派人</div>
        </template>
        {{ drawerProps.rowData.repairMan ?? "--" }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">维修人</div>
        </template>
        {{ drawerProps.rowData.engineer ?? "--" }}
      </el-descriptions-item>

      <el-descriptions-item>
        <template #label>
          <div class="cell-item">维修时间</div>
        </template>
        {{ drawerProps.rowData.repairTime ?? "--" }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">维修类型</div>
        </template>
        {{ drawerProps.repairTypeOptions?.find(item => item.value == drawerProps.rowData.repairType)?.label }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">维修状态</div>
        </template>
        <el-tag :type="repairStateOptions.find(item => item.value === drawerProps.rowData.repairState)?.tagType">{{
          repairStateOptions.find(item => item.value === drawerProps.rowData.repairState)?.label
        }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">维修说明</div>
        </template>
        {{ drawerProps.rowData.repairNote }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">报修人评分</div>
        </template>
        {{ drawerProps.rowData.rating }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">用户反馈</div>
        </template>
        {{ drawerProps.rowData.ratingMessage }}
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="RepairViewDrawer">
import { ref } from "vue";
import { Repair } from "@/api/interface/service/repair";
import { DictOptions } from "@/api/interface";
import { ElImage } from "element-plus";

const filePath = import.meta.env.VITE_APP_BASE_FILE;

interface DrawerProps {
  title: string;
  rowData: Partial<Repair.ResRepair>;
  repairTypeOptions?: DictOptions[];
}
const repairStateOptions = ref<DictOptions[]>([
  { label: "待维修", value: 0, tagType: "danger" },
  { label: "已维修", value: 1, tagType: "primary" },
  { label: "待返修", value: 2, tagType: "warning" },
  { label: "已完结", value: 3, tagType: "success" }
]);
// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  rowData: {}
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  console.log(params);
};

defineExpose({
  acceptParams
});
</script>
