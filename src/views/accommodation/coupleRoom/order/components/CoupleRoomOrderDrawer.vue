<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}客房订单`">
    <el-descriptions class="margin-top" title="订单信息" :column="3" border>
      <el-descriptions-item>
        <template #label><i class="el-icon-time"></i>申请时间</template>{{ drawerProps.rowData.createTime }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label><i class="el-icon-time"></i>入住时间</template>{{ drawerProps.rowData.startTime }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label><i class="el-icon-time"></i>退宿时间</template>{{ drawerProps.rowData.endTime }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label><i class="el-icon-time"></i>住宿天数</template>{{ drawerProps.rowData.day }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label><i class="el-icon-money"></i>费用</template>{{ drawerProps.rowData.price }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label><i class="el-icon-user"></i>申请人</template>{{ drawerProps.rowData.name }}
      </el-descriptions-item>
      <el-descriptions-item :span="3">
        <template #label><i class="el-icon-office-building"></i>房间号</template>{{ drawerProps.rowData.chamberName }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label><i class="el-icon-edit"></i>备注信息</template>{{ drawerProps.rowData.remark }}
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions
      v-for="staff in staffListMale"
      :key="staff.id"
      class="margin-top"
      style="margin-top: 10px"
      title="男方信息"
      :column="3"
      border
    >
      <el-descriptions-item>
        <template #label><i class="el-icon-user"></i>姓名</template>{{ staff.name }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label><i class="el-icon-user"></i>账号</template>{{ staff.username }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label><i class="el-icon-location-outline"></i>岗位</template>{{ staff.job }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label><i class="el-icon-tickets"></i>部门</template>{{ staff.dept }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label><i class="el-icon-mobile-phone"></i>电话</template>{{ staff.tel }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label><i class="el-icon-office-building"></i>入职时间</template>{{ staff.entrtyTime }}
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions
      v-for="staff in staffListFemale"
      :key="staff.id"
      class="margin-top"
      style="margin-top: 10px"
      title="女方信息"
      :column="3"
      border
    >
      <el-descriptions-item>
        <template #label><i class="el-icon-user"></i>姓名</template>{{ staff.name }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label><i class="el-icon-user"></i>账号</template>{{ staff.username }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label><i class="el-icon-location-outline"></i>岗位</template>{{ staff.job }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label><i class="el-icon-tickets"></i>部门</template>{{ staff.dept }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label><i class="el-icon-mobile-phone"></i>电话</template>{{ staff.tel }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label><i class="el-icon-office-building"></i>入职时间</template>{{ staff.entrtyTime }}
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions
      v-for="audit in drawerProps.rowData.auditList"
      :key="audit.id"
      class="margin-top"
      :title="audit.title"
      :column="2"
      border
      style="margin-top: 10px"
    >
      <el-descriptions-item>
        <template #label><i class="el-icon-user"></i>审核人</template>{{ audit.name }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label><i class="el-icon-user"></i>审核时间</template>{{ audit.createTime }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label><i class="el-icon-location-outline"></i>结果</template>
        <el-tag type="success" v-if="audit.status === 1">同意</el-tag>
        <el-tag type="danger" v-if="audit.status === 2">拒绝</el-tag>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label><i class="el-icon-tickets"></i>意见</template>{{ audit.content }}
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button type="primary" @click="drawerVisible = false">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="ProcessDrawer">
import { ref, computed } from "vue";
import { CoupleRoom } from "@/api/interface/service/coupleRoom";

interface DrawerProps {
  title: string;
  rowData: Partial<CoupleRoom.ResRoomOrder>;
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
};

defineExpose({
  acceptParams
});

// 过滤男方和女方
const staffListMale = computed(() => (drawerProps.value.rowData.staffList || []).filter(staff => staff.sex === "男"));
const staffListFemale = computed(() => (drawerProps.value.rowData.staffList || []).filter(staff => staff.sex === "女"));
</script>
