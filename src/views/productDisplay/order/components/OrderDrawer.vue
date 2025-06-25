<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="800" :title="`${drawerProps.title}订单详情`">
    <el-descriptions :column="3" border :data="drawerProps.rowData">
      <el-descriptions-item label="订单编号">{{ drawerProps.rowData.no }}</el-descriptions-item>
      <el-descriptions-item label="姓名">{{ drawerProps.rowData.name }}</el-descriptions-item>
      <el-descriptions-item label="工号">{{ drawerProps.rowData.nick }}</el-descriptions-item>
      <el-descriptions-item label="联系电话">{{ drawerProps.rowData.tel }}</el-descriptions-item>
      <el-descriptions-item label="餐厅">{{ drawerProps.rowData.canteenName }}</el-descriptions-item>
      <el-descriptions-item label="取餐类型">
        <el-tag :type="drawerProps.pickupTypeOptions?.find(item => item.value === drawerProps.rowData.pickupType)?.tagType">{{
          drawerProps.pickupTypeOptions?.find(item => item.value === drawerProps.rowData.pickupType)?.label
        }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="配送地址">{{ drawerProps.rowData.address }}</el-descriptions-item>
      <el-descriptions-item label="配送时间">{{ drawerProps.rowData.deliveryArea }}</el-descriptions-item>
      <el-descriptions-item label="配送费">{{ drawerProps.rowData.postPrice }}</el-descriptions-item>

      <el-descriptions-item label="总金额">{{ drawerProps.rowData.totalPrice }}</el-descriptions-item>
    </el-descriptions>
    <el-table :data="drawerProps.orderDetailDishList" border style="margin-top: 20px" :show-summary="true" max-height="400">
      <el-table-column prop="name" label="商品名称" />
      <el-table-column prop="num" label="数量" />
      <el-table-column prop="deal" label="份量" />
      <el-table-column prop="taste" label="口味" />
      <el-table-column prop="price" label="总价" />
    </el-table>
    <template #footer>
      <el-button type="primary" @click="drawerVisible = false">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="OrderDrawer">
import { ref } from "vue";
import { Order } from "@/api/interface/productDisplay/order";
import { DictOptions } from "@/api/interface";
// 图片地址
// const imageUrl = "https://web.iwipwedaba
interface DrawerProps {
  title: string;
  rowData: Partial<Order.ResOrder>;
  getTableList?: () => Promise<any>;
  pickupTypeOptions?: DictOptions[];
  orderDetailDishList?: Order.ResOrderDish[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  rowData: {
    name: "",
    status: 0
  },
  orderDetailDishList: []
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
