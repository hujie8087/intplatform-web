<template>
  <div class="print-template">
    <template v-for="item in orderData" :key="item.orderNo">
      <div v-for="page in item.pageNumber" :key="item.orderNo + '#' + page" class="order">
        <div class="header-barcode border-bottom">
          <div class="header">
            <div class="date font-35">{{ item.orderDate }}</div>
            <div class="carCode font-35" :class="{ font30: item.fcName == FoodPickupType }">
              {{ item.fcName }}
            </div>
          </div>
          <div class="barcode">
            <Barcode :value="getBarcodeValue(item, page)" />
          </div>
        </div>
        <div class="location border-bottom">
          <div>LOKASI送餐点:</div>
          <div class="location-code" :style="calculateFontSizeAndLineHeight(item.deliverySite)">
            {{ item.deliverySite }}
          </div>
        </div>
        <div class="customer-info border-bottom" :style="calculateFontSizeAndLineHeight(item.createBy + item.jobNumber)">
          {{ item.createBy }}
          {{ item.jobNumber }}
        </div>
        <div class="order-info border-bottom">
          <div>TOTAL订单数量:</div>
          <div class="order-quantity">
            {{ item.num < item.pageSize ? item.num : handleOrderNum(item, page) }}{{ item.pageNumber > 1 ? `/${item.num}` : "" }}
          </div>
        </div>
        <div class="meal-info">{{ foodType[item.foodType] }} {{ foodName[item.foodName] }} {{ item.pageNumber }}-{{ page }}</div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts" name="FoodDelivery">
import { ref, computed, watch } from "vue";
import Barcode from "./Barcode.vue";

// Props
interface Props {
  batchOrderData: any[];
}

const props = withDefaults(defineProps<Props>(), {
  batchOrderData: () => []
});

// 响应式数据
const orderData = ref(props.batchOrderData);
const FoodPickupType = ref("自取餐");

// 监听 props 变化
watch(
  () => props.batchOrderData,
  newVal => {
    orderData.value = newVal;
  },
  { immediate: true }
);

// 计算属性
const foodType = computed(() => ({
  0: "CHINA PACK MEAL 中国餐",
  1: "FORMULIR TAMBAHAN PACK MEAL 印尼餐",
  2: "Air botol 桶装水"
}));

const foodName = computed(() => ({
  0: "Sarapan Pagi 早餐",
  1: "Makan Siang 午餐",
  2: "Makan Malam 晚餐",
  3: "Makan Tengah Malam 夜宵",
  5: "Takjil 点心",
  6: "Sahur 凌晨餐"
}));

// 方法
const handleOrderNum = (item: any, index: number) => {
  if (index < item.pageNumber) {
    return item.pageSize;
  }
  return item.num - (item.pageNumber - 1) * item.pageSize;
};

const getBarcodeValue = (item: any, index: number) => {
  if (item.num <= item.pageSize) {
    return item.orderNo;
  }
  return `${item.orderNo}#${index}`;
};

const calculateFontSizeAndLineHeight = (text: string) => {
  let fontSize = 18;
  const length = text.length;

  if (length <= 4) {
    const chineseRegex = /^[\u4e00-\u9fa5]+$/; // 正则表达式匹配中文字符范围
    if (chineseRegex.test(text)) {
      fontSize = 50;
    } else {
      fontSize = 75;
    }
  } else if (length < 7) {
    fontSize = 55;
  } else if (length <= 10) {
    fontSize = 40;
  } else if (length < 20) {
    fontSize = 30;
  } else if (length < 30) {
    fontSize = 25;
  } else if (length < 40) {
    fontSize = 20;
  } else {
    fontSize = 18;
  }

  return { "font-size": fontSize + "pt", "line-height": fontSize + "pt" };
};
</script>

<style scoped>
/* 组件基础样式 */
.print-template {
  width: 100%;
  height: 100%;
}
.order {
  width: 98%;
  height: 99%;
  max-height: 99%;
  margin: 0 auto;
  font-family: Helvetica, Arial, sans-serif;
}
.border-bottom {
  border-bottom: 1pt solid #4a4a4a;
}
.barcode {
  display: flex;
  flex-direction: column;
  height: 22%;
}
.header {
  display: flex;
  justify-content: space-between;
  height: 50px;
}
.date {
  width: 60%;
  max-width: 60%;
}
.font30 {
  font-size: 26px !important;
}
.carCode {
  width: calc(40% - 1px);
  max-width: calc(40% - 1px);
  padding: 0 5px;
  border-left: 1px solid #262626;
}
.font-35 {
  font-size: 32px;
  font-weight: bold;
  line-height: 50px;
  color: #323232;
  text-align: center;
}
.location {
  height: 28%;
  max-height: 28%;
}
.location-code {
  font-weight: bold;
  text-align: center;
  word-break: break-word;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
.fontSmall {
  font-size: 65px !important;
  line-height: 65px !important;
}
.customer-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 23%;
  max-height: 23%;
  font-weight: bold;
  text-align: center;
}
.order-info {
  height: 20%;
  font-size: 14px;
}
.order-quantity {
  font-size: 60pt;
  font-weight: bold;
  line-height: 80px;
  text-align: center;
}
.meal-info {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 7%;
  font-size: 8pt;
  font-weight: bold;
  line-height: 10pt;
  text-align: center;
}
</style>
