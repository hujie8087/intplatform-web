<template>
  <!-- <div class="setting-item h-50"> -->
  <!-- <el-text size="default" class="block-title2">图标</el-text>
    <el-radio-group v-model="comp.rateCharacter" size="default" fill="#6cf">
      <el-radio-button v-for="item in imgList" :key="item" :value="item" @click="changeRateCharacter(item)">
        <el-icon :size="20">
          <Edit />
        </el-icon>
      </el-radio-button>
    </el-radio-group> -->
  <!-- </div> -->
  <div class="setting-item h-50">
    <el-text size="default" class="block-title2">数量</el-text>
    <el-select size="default" v-model="comp.rateCount" style="width: 120px" class="abs-r" @change="changeRateCount">
      <el-option v-for="(item, index) in dataList" :key="index" :label="item.name" :value="item.value" />
    </el-select>
  </div>
  <div class="setting-item h-50">
    <el-text size="default" class="block-title2">允许半选</el-text>
    <el-switch size="default" v-model="comp.rateAllowHalf" @change="changeHalf($event)" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";

const compStore = useSelectCompStore();

interface Props {
  comp: any;
}

const props = defineProps<Props>();
const comp = ref(props.comp);
const dataList: any = ref([]);
// const imgList = ["⭐️", "❤️", "😊"];

const changeRateCount = (event: any) => {
  console.log(event, "event");
  compStore.updateCurrentComp({
    rateCount: event
  });
};

// const changeRateCharacter = (iconComponent: any) => {
//   // 获取图标组件名称（用于展示信息）
//   const iconName = iconComponent.name;
//   compStore.updateCurrentComp({
//     rateCharacter: iconName
//   });
// };

const changeHalf = (event: any) => {
  compStore.updateCurrentComp({
    rateAllowHalf: event
  });
};

onMounted(() => {
  for (let i = 1; i <= 10; i++) {
    dataList.value.push({
      name: i + " 个",
      value: i
    });
  }
});
</script>

<style lang="scss" scoped>
.setting-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.comp {
  padding: 10px;
  margin-bottom: 10px;
  color: yellowgreen;
}
.rate-character-icon {
  display: flex;
  flex: 0 0 auto;
}
.icon-list {
  display: flex;
  gap: 20px;
  padding: 20px;
}
.icon-item {
  padding: 8px;
  font-size: 14px;
  color: #666666;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}
.icon-item:hover {
  color: #409eff;
  background-color: #f0f7ff;
}
.icon-item:active {
  transform: scale(0.95);
}
</style>
