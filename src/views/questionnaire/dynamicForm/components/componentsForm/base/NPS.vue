<template>
  <div class="nps-list">
    <div
      class="nps-item"
      v-for="(item, index) in list"
      :key="index"
      @mouseenter="!isDev && changeIndex(index)"
      @mouseleave="!isDev && changeIndex(-1)"
      @click="!isDev && selectValue(item)"
    >
      <span
        class="item"
        :class="{
          isDev,
          hoverChildrenIndex: hoverIndex >= index,
          active: list.includes(0) ? props.dataValue >= index : props.dataValue > index
        }"
        >{{ item }}</span
      >
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";

interface Props {
  id: string;
  dataValue: number;
  startValue: number;
  rateCount: number;
  isDev: boolean;
  isSelected: boolean;
}
const compStore = useSelectCompStore();
const props = defineProps<Props>();
const hoverIndex = ref(-1);
const list = computed(() => {
  let _val = [];
  for (let i = props.startValue; i <= props.rateCount; i++) {
    _val.push(i);
  }
  return _val;
});

const changeIndex = (index: number) => {
  hoverIndex.value = index;
};

const selectValue = (item: any) => {
  console.log(item, "item--->");
  compStore.updateCurrentComp({
    dataValue: item
  });
};
</script>
<style lang="scss">
.nps-list {
  display: flex;
  flex-basis: content;
  flex-wrap: wrap;
}
.nps-item {
  display: inline-flex;
  width: 32px;
  height: 30px;
  margin-top: 2px;
  margin-right: 4px;
  margin-bottom: 2px;
  font-size: 22px;
  line-height: 30px;
  .item {
    width: 30px;
    height: 30px;
    padding: 0;
    color: #ffffff;
    text-align: center;
    cursor: pointer;
    background: #dee0e3;
    border-radius: 6px;
    &:hover:not(.isDev),
    &.hoverChildrenIndex {
      background: rgb(22 119 255 / 66%);
    }
    &.active:not(.isDev) {
      background: #1677ff;
    }
  }
  .isDev {
    cursor: no-drop;
  }
}
</style>
