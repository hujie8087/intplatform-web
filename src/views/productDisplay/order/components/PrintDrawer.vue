<!-- 打印页面 -->
<template>
  <el-dialog v-model="dialogFormVisible" width="900">
    <div class="print-page">
      <el-row :gutter="50">
        <el-col :span="12" v-for="(order, index) in orderDetails" :key="order.id + index">
          <el-button type="primary" @click="print('print' + index)">打印</el-button>
          <div style="width: 300px" :id="'print' + index">
            <h1 style="margin-bottom: 10px">{{ order.canteenName }}</h1>
            <div style="text-align: left">
              <h3>
                订单号: <span>{{ order.no }}</span>
              </h3>
              <h3>配送联系电话：{{ order.statusName }}</h3>
              <h3>
                姓名: <span>{{ order.name }}</span>
              </h3>
              <h3>
                电话: <span>{{ order.tel }}</span>
              </h3>
              <h3 v-if="order.pickupType == 1">取餐类型: <span>堂食</span></h3>
              <h3 v-if="order.pickupType == 2">取餐类型: <span>打包</span></h3>
              <h3 v-if="order.pickupType == 3">取餐类型: <span>配送</span></h3>
              <h3 v-if="order.pickupType == 1 && order.tableNumber">
                桌号: <span>{{ order.tableNumber }}</span>
              </h3>
              <h3 v-if="order.pickupType == 3">
                配送地址: <span>{{ order.address }}</span>
              </h3>
              <h3 v-if="order.pickupType == 3">
                预计送达: <span>{{ order.deliveryArea }}</span>
              </h3>
              <h3 v-if="order.pickupType == 3">
                配送区域: <span>{{ order.expectedTime }}</span>
              </h3>
              <h3 v-if="order.pickupType == 3">
                货架: <span>{{ order.pickupCode }}</span>
              </h3>
              <h3>
                下单时间: <span>{{ order.createTime }}</span>
              </h3>
            </div>
            <hr />

            <!-- 订单明细表格 -->
            <el-table
              :data="order.orderDetailsList"
              size="small"
              :cell-style="{ padding: '0' }"
              :header-cell-style="{
                border: 'none',
                textAlign: 'center',
                fontSize: '14px',
                padding: '0'
              }"
              :border="false"
            >
              <el-table-column prop="code" label="编码" width="50" align="center" />
              <el-table-column prop="name" label="名称" align="center" />
              <el-table-column prop="num" label="数量" width="50" align="center" />
              <el-table-column prop="price" label="价格" width="50" align="center" />
            </el-table>

            <hr />

            <!-- 订单总价 -->
            <h3>
              总价: <span>{{ order.totalPrice }}</span>
            </h3>
            <h3>
              备注: <span>{{ order.remark }}</span>
            </h3>

            <!-- 二维码 -->
            <div style="margin-top: 15px">
              <h3>扫描二维码查看订单</h3>
              <QrCode :value="order.no" :size="150" />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import QrCode from "./QrCode.vue";
import { Order } from "@/api/interface/productDisplay/order";
import { getPrintOrder } from "@/api/modules/productDisplay/order";

// 响应式数据
const orderDetails = ref<Order.ResOrder[]>([]);
const dialogFormVisible = ref(false);

// 接收父组件传过来的参数
const acceptParams = (params: { orderId: number }): void => {
  dialogFormVisible.value = true;
  findOrder(params.orderId);
};
// 获取订单详情
const findOrder = async (orderId: number) => {
  try {
    const { data } = await getPrintOrder(orderId);
    orderDetails.value = data;
  } catch (error) {
    console.error("获取订单详情失败:", error);
  }
};

// 打印功能
const print = async (id: string) => {
  const content = document.getElementById(id)?.innerHTML;
  if (!content) return;

  // 创建隐藏 iframe
  const iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.top = "-9999px";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(`
    <html>
      <head>
        <title>打印</title>
        <style>
          body {
            padding: 10px;
          }
          table {
            width: 100%;
          }
          .el-table__header-wrapper {
            background-color: #f5f5f5;
            padding: 0px;
            border-bottom: 1px solid #000;
            line-height: 30px;
          }
          .el-table__header-wrapper .cell {
            line-height: 30px;
            padding: 0px;
            text-align: center;
          }
          .el-table__body-wrapper {
            padding: 0px;
            line-height: 30px;
          }
          .el-table__body-wrapper .cell {
            line-height: 30px;
            padding: 0px;
            text-align: center;
          }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `);
  doc.close();

  // 延迟确保内容加载完成后打印
  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe); // 打印后清理
    }, 100);
  };
};

// 暴露方法给父组件
defineExpose({
  acceptParams
});
</script>

<style scoped lang="scss">
.print-page {
  width: 100%;
  height: 100%;
  h3,
  h1 {
    margin: 8px 0;
    font-weight: bold !important;
    color: #000000;
  }
  h1 {
    text-align: center;
  }
  hr {
    margin: 10px 0;
    border: 1px dashed black;
  }
}
</style>
