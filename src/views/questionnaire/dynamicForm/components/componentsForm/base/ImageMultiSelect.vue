<template>
  <div class="imageMultiSelect">
    <div v-for="(item, index) in props.dataList" :key="index" class="image-block">
      <div class="title">{{ item.label }}</div>
      <el-text size="small" class="desc">
        {{ item.desc }}
      </el-text>
      <el-image class="img" :src="getImageUrl(item.imageUrl)" fit="cover" />
      <div class="btn">
        <el-button
          :disabled="isDev && isSelected"
          v-if="dataValue != item.value"
          @click="voting(item)"
          style="width: 100%"
          icon="Star"
          type="primary"
          >Voting / 为TA投票</el-button
        >
        <div class="btn_group" v-else>
          <el-button style="width: 60%" disabled icon="Star" type="primary"> 您已投票 </el-button>
          <el-button @click="cancelVoting(item)" style="width: 30%" type="danger">取消</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
const compStore = useSelectCompStore();
const filePath = import.meta.env.VITE_APP_BASE_FILE;

interface Props {
  dataList: Array<any>;
  dataValue: string;
  layoutType: string;
  placeholder: string;
  isDev: boolean;
  isSelected: boolean;
  isPreviewRender?: boolean;
  minValue: Number;
  maxValue: Number;
}
const props = defineProps<Props>();
const dataValue = ref(props.dataValue);

const defUrl = "/image/2025/09/01/640 (11).jpg";
const getImageUrl = (imgUrl: string) => {
  try {
    if (imgUrl != "") {
      return filePath + imgUrl;
    }
    return filePath + defUrl;
  } catch (e) {
    return filePath + defUrl;
  }
};

// 投票
const voting = item => {
  console.log(item, "item");
  dataValue.value = item.value;
};

const cancelVoting = item => {
  console.log(item, "item");
  dataValue.value = "";
};

watch(
  () => dataValue.value,
  newValue => {
    compStore.updateCurrentComp({
      dataValue: newValue
    });
  },
  {
    deep: true // 因为是数组，需要深度监听
  }
);
</script>

<style lang="scss" scoped>
.imageMultiSelect {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.image-block {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: calc(50% - 8px);
  .title {
    min-height: 24px;
  }
  .desc {
    align-self: first baseline !important;
    min-height: 20px;
    margin-top: 4px;
    line-height: 24px;
  }
  .img {
    width: 100%;
    height: 180px;
  }
  .btn {
    margin-top: 10px;
    text-align: center;
  }
}
</style>
