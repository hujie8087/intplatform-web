<template>
  <div class="print-order-list">
    <table>
      <colgroup>
        <col width="70" />
        <col width="100" />
        <col width="80" />
        <col width="80" />
        <col width="50" />
        <col width="50" />
        <col width="50" />
        <col width="100" />
        <col width="50" />
        <col width="80" />
        <col width="80" />
        <col width="100" />
        <col width="80" />
        <col width="80" />
      </colgroup>
      <tr>
        <td colspan="14" style=" padding: 10px; font-size: 20px; color: red;text-align: center; vertical-align: middle">
          <p v-if="props.foodTypeList[0] == '0'">打包饭申报、配送汇总表<br />CHINA PACK MEAL 中国餐</p>
          <p v-else>打包饭申报、配送汇总表<br />Indonesia PACK MEAL 印尼餐</p>
        </td>
      </tr>
      <tr>
        <th>
          日期 <br />
          TANGGAL
        </th>
        <th>
          部门 <br />
          DEPARTEMEN
        </th>
        <th>
          申报人 <br />
          YANG PESAN
        </th>
        <th>
          申报人工号 <br />
          NO ID PEMESAN
        </th>
        <th>
          订餐数量 <br />
          TOTAL
        </th>
        <th>
          餐类 <br />
          JADWAL MAKAN
        </th>
        <th>
          送餐点<br />
          LOKASI
        </th>
        <th>
          联系电话 <br />
          NOMOR TELPON
        </th>
        <th>
          食堂打包数量 <br />
          TOTAL
        </th>
        <th>
          取餐人姓名 <br />
          NAMA PENERIMA
        </th>
        <th>
          取餐人工号 <br />
          NO ID
        </th>
        <th>
          取餐时间 <br />
          WAKTU PENGAMBILAN
        </th>
        <th>
          打包类型<br />
          JENIS KEMASAN
        </th>
        <th>
          取餐食堂 <br />
          AMBIL SENDIRI
        </th>
      </tr>
      <tr v-for="item in props.orderList" :key="item.orderNo">
        <td>{{ item.orderDate }}</td>
        <td>{{ item.deptPath }}</td>
        <td>{{ item.createBy }}</td>
        <td>{{ item.jobNumber }}</td>
        <td>{{ item.num }}</td>
        <td>
          {{ props.foodTypeOptions.find(foodType => foodType.value === item.foodType)?.label }}<br />{{
            props.foodTypeOptions.find(foodType => foodType.value === item.foodType)?.idLabel
          }}
        </td>
        <td>{{ item.deliverySite }}</td>
        <td>{{ item.phoneNumber }}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>
          <template v-if="item.packageType">
            {{ item.packageType == "0" ? "打包饭" : "盒装饭" }}<br />
            {{ item.packageType == "0" ? "Di Bungkus" : "Kotak Makan" }}
          </template>
        </td>
        <td>
          <span style="white-space: normal">
            {{ item.canteen }}
          </span>
        </td>
      </tr>
    </table>
    <!-- <div class="fcName">{{ props.fcName[0] }}</div> -->
  </div>
</template>

<script setup lang="ts">
import { DictOptions } from "@/api/interface";
import { MdcOrder } from "@/api/interface/mealDelivery/order";
import { PropType } from "vue";

const props = defineProps({
  orderList: {
    type: Array as PropType<MdcOrder.ResFoodOrderDeliverySummary[]>,
    required: true
  },
  foodTypeList: {
    type: Array,
    required: true
  },
  foodTypeOptions: {
    type: Array as PropType<DictOptions[]>,
    required: true
  }
});
</script>

<style scoped></style>
