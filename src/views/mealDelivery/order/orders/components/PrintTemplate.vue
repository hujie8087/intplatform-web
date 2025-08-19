<template>
  <div>
    <!-- 预览区域 -->
    <div v-if="showPrintFrame && isPreview" class="preview-overlay">
      <div class="preview-header">
        <span>打印预览</span>
        <el-button type="text" @click="closePreview" style="color: #ffffff">✕</el-button>
      </div>
      <iframe ref="previewFrame" style="width: 100%; height: calc(100% - 40px); background: white; border: none"></iframe>
    </div>
    <!-- 隐藏的打印区域 -->
    <iframe
      v-if="showPrintFrame && !isPreview"
      ref="printFrame"
      style="position: absolute; top: -9999px; left: -9999px; width: 100%; height: 100%"
    ></iframe>
  </div>
</template>

<script setup lang="ts" name="PrintTemplate">
import { ref, nextTick } from "vue";
import { createApp, h } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import FoodDelivery from "./FoodDelivery.vue";
import PrintTable from "./PrintTable.vue";
import { MdcOrder } from "@/api/interface/mealDelivery/order";

// 响应式数据
const showPrintFrame = ref(false);
const printFrame = ref<HTMLIFrameElement>();
const previewFrame = ref<HTMLIFrameElement>();
const isPreview = ref(true); // 新增：控制预览或打印

// 打印方法
const printOrder = (batchOrderData: MdcOrder.ResFoodOrderDeliverySummary[], callback: () => void) => {
  showPrintFrame.value = true;
  isPreview.value = false; // 切换到打印模式

  nextTick(() => {
    if (!printFrame.value) {
      console.error("打印框架未找到");
      return;
    }

    const iframe = printFrame.value;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!iframeDoc) {
      console.error("无法访问 iframe 文档");
      return;
    }

    // 创建打印页面的 HTML 结构
    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>打印订单</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            @page {
              margin: 0;
              padding: 0;
              size: A4;
            }
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              font-family: "Helvetica", "Arial", sans-serif;
            }
            .print-template {
              width: 100%;
              height: 100%;
            }
            .order {
              width: 98%;
              height: 99%;
              max-height: 99%;
              margin: 0 auto;
              font-family: "Helvetica", "Arial", sans-serif;
              page-break-after: always;
              display: flex;
              flex-direction: column;
            }
            .border-bottom {
              border-bottom: 1pt solid #4a4a4a;
            }
            .header-barcode {
              height: 22%;
              display: flex;
              flex-direction: column;
            }
            .header {
              height: 50px;
              display: flex;
              justify-content: space-between;
            }
            .date {
              width: 60%;
              max-width: 60%;
            }
            .font30 {
              font-size: 26px !important;
            }
            .carCode {
              padding: 0 5px;
              width: calc(40% - 1px);
              max-width: calc(40% - 1px);
              border-left: 1px solid #262626;
            }
            .font-35 {
              font-size: 32px;
              color: #323232;
              font-weight: bold;
              text-align: center;
              line-height: 50px;
            }
            .location {
              height: 28%;
              max-height: 28%;
            }
            .location-code {
              text-align: center;
              font-weight: bold;
              word-wrap: break-word;
              overflow-wrap: break-word;
              word-break: break-word;
            }
            .fontSmall {
              font-size: 65px !important;
              line-height: 65px !important;
            }
            .customer-info {
              height: 23%;
              max-height: 23%;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-weight: bold;
              text-align: center;
            }
            .order-info {
              height: 20%;
              font-size: 14px;
            }
            .order-quantity {
              text-align: center;
              font-size: 60pt;
              line-height: 80px;
              font-weight: bold;
            }
            .meal-info {
              height: 7%;
              font-weight: bold;
              font-size: 10pt;
              line-height: 10pt;
              display: flex;
              align-items: center;
              text-align: center;
              justify-content: center;
            }
            }
          </style>
        </head>
        <body>
          <div id="app" class="print-template"></div>
        </body>
      </html>
    `;

    // 写入 HTML 内容
    iframeDoc.open();
    iframeDoc.write(printHtml);
    iframeDoc.close();

    console.log("HTML 内容已写入 iframe");

    // 等待 iframe 加载完成
    iframe.onload = () => {
      console.log("iframe 加载完成，开始创建 Vue 应用...");

      const app = createApp({
        render() {
          return h(FoodDelivery, {
            batchOrderData: batchOrderData
          });
        }
      });
      // 挂载到 iframe 中的 app 元素
      const appElement = iframeDoc.getElementById("app");
      if (appElement) {
        app.mount(appElement);
        console.log("Vue 应用已挂载到 iframe");

        // 延迟打印，确保内容渲染完成
        setTimeout(() => {
          console.log("开始打印...");
          iframe.contentWindow?.print();
          // 打印完成后隐藏 iframe
          setTimeout(() => {
            showPrintFrame.value = false;
            callback();
          }, 1000);
        }, 1000); // 增加延迟时间确保样式完全加载
      } else {
        console.error("未找到 app 元素");
      }
    };
  });
};

// 打印A4
const printOrderA4 = (batchOrderData: any, callback: () => void) => {
  showPrintFrame.value = true;
  isPreview.value = false; // 切换到打印模式

  nextTick(() => {
    if (!printFrame.value) {
      console.error("打印框架未找到");
      return;
    }

    const iframe = printFrame.value;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!iframeDoc) {
      console.error("无法访问 iframe 文档");
      return;
    }

    // 创建打印页面的 HTML 结构
    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>打印订单</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            @page {
              margin: 0;
              padding: 0;
              size: A4;
            }
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              font-family: "Helvetica", "Arial", sans-serif;
            }
            .print-template {
              width: 100%;
              height: 100%;
            }
            .order {
              width: 98%;
              height: 99%;
              max-height: 99%;
              margin: 0 auto;
              font-family: "Helvetica", "Arial", sans-serif;
              page-break-after: always;
              display: flex;
              flex-direction: column;
            }
            .border-bottom {
              border-bottom: 1pt solid #4a4a4a;
            }
            .header-barcode {
              height: 22%;
              display: flex;
              flex-direction: column;
            }
            .header {
              height: 50px;
              display: flex;
              justify-content: space-between;
            }
            .date {
              width: 60%;
              max-width: 60%;
            }
            .font30 {
              font-size: 26px !important;
            }
            .carCode {
              padding: 0 5px;
              width: calc(40% - 1px);
              max-width: calc(40% - 1px);
              border-left: 1px solid #262626;
            }
            .font-35 {
              font-size: 32px;
              color: #323232;
              font-weight: bold;
              text-align: center;
              line-height: 50px;
            }
            .location {
              height: 28%;
              max-height: 28%;
            }
            .location-code {
              text-align: center;
              font-weight: bold;
              word-wrap: break-word;
              overflow-wrap: break-word;
              word-break: break-word;
            }
            .fontSmall {
              font-size: 65px !important;
              line-height: 65px !important;
            }
            .customer-info {
              height: 23%;
              max-height: 23%;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-weight: bold;
              text-align: center;
            }
            .order-info {
              height: 20%;
              font-size: 14px;
            }
            .order-quantity {
              text-align: center;
              font-size: 60pt;
              line-height: 80px;
              font-weight: bold;
            }
            .meal-info {
              height: 7%;
              font-weight: bold;
              font-size: 10pt;
              line-height: 10pt;
              display: flex;
              align-items: center;
              text-align: center;
              justify-content: center;
            }
              table {
                table-layout: fixed;
                width: 100%;
                border-collapse: collapse;
                border-spacing: 0;
                border: 1px solid #000;
              }
              th,
              td {
                font-size: 10px;
                border: 1px solid #ddd;
                padding: 5px;
                text-align: center;
              }
              tr:nth-child(even) {
                background-color: #f2f2f2;
              }

              .fcName {
                font-size: 20px;
                position: absolute;
                right: 10px;
                top: 10px;
              }
            }
          </style>
        </head>
        <body>
          <div id="app" class="print-template"></div>
        </body>
      </html>
    `;

    // 写入 HTML 内容
    iframeDoc.open();
    iframeDoc.write(printHtml);
    iframeDoc.close();

    console.log("HTML 内容已写入 iframe");

    // 等待 iframe 加载完成
    iframe.onload = () => {
      console.log("iframe 加载完成，开始创建 Vue 应用...");

      const app = createApp({
        render() {
          return h(PrintTable, {
            orderList: batchOrderData.data,
            foodTypeOptions: batchOrderData.foodTypeOptions,
            foodTypeList: batchOrderData.foodTypeList
          });
        }
      });

      app.use(ElementPlus);
      // 挂载到 iframe 中的 app 元素
      const appElement = iframeDoc.getElementById("app");
      if (appElement) {
        app.mount(appElement);
        console.log("Vue 应用已挂载到 iframe");
        console.log(appElement);
        // 延迟打印，确保内容渲染完成
        setTimeout(() => {
          console.log("开始打印...");
          iframe.contentWindow?.print();
          // 打印完成后隐藏 iframe
          setTimeout(() => {
            showPrintFrame.value = false;
            callback();
            console.log("打印完成，隐藏 iframe");
          }, 1000);
        }, 1000); // 增加延迟时间确保样式完全加载
      } else {
        console.error("未找到 app 元素");
      }
    };
  });
};

// 关闭预览方法
const closePreview = () => {
  showPrintFrame.value = false;
  isPreview.value = false; // 确保切换到打印模式
  console.log("关闭预览");
};

// 暴露方法给父组件
defineExpose({
  printOrder,
  printOrderA4
});
</script>

<style scoped>
.preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: rgb(0 0 0 / 80%);
}
.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 20px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background: #409eff;
}
</style>
