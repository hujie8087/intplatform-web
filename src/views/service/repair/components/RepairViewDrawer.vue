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
        <el-image
          v-for="img in drawerProps.rowData.repairPhoto?.split(',')"
          :key="img"
          style="width: 100px; height: 100px"
          :src="img"
          :zoom-rate="1.2"
          :max-scale="7"
          :min-scale="0.2"
          :preview-src-list="drawerProps.rowData.repairPhoto?.split(',')"
          :initial-index="4"
          fit="cover"
        />
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">分派人</div>
        </template>
        {{ drawerProps.rowData.repairMan ?? "--" }}
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
        {{ drawerProps.rowData.repairType }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">维修状态</div>
        </template>
        <el-tag :type="drawerProps.rowData.repairState === 0 ? 'danger' : 'primary'">{{
          drawerProps.rowData.repairState === 0 ? "待维修" : "已维修"
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
          <div class="cell-item">评分信息</div>
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

interface DrawerProps {
  title: string;
  rowData: Partial<Repair.ResRepair>;
  repairTypeOptions?: DictOptions[];
  repairStatusOptions?: DictOptions[];
}

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
