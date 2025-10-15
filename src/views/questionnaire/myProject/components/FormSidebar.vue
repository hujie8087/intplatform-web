<template>
  <div class="sidebar">
    <div
      class="item"
      v-for="item in classifyList"
      @click="selectSideItemType(item.type)"
      :key="item.label"
      :class="{ active: item.type === props.currentSideItemType }"
    >
      <img class="icon" :src="item.icon" alt="" />
      <div class="label">{{ item.label }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import Icon from "../../dynamicForm/components/compIcon";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
interface Props {
  currentSideItemType?: "questionBank" | "theme" | "logic" | "sample" | "publish" | "stat" | "setting" | string;
}

interface ClassifyType {
  label: string;
  icon: any;
  type: "questionBank" | "theme" | "logic" | "sample" | "publish" | "stat" | "setting";
}
const emit = defineEmits(["selectSideItemType"]);
const props = defineProps<Props>();

const classifyList = ref<ClassifyType[]>([
  {
    label: t("survey.form.tab.questionBank"),
    icon: Icon.Question,
    type: "questionBank"
  },
  {
    label: t("survey.form.tab.sample"),
    icon: Icon.Sample,
    type: "sample"
  },
  {
    label: t("survey.form.tab.setting"),
    icon: Icon.Setting,
    type: "setting"
  },
  {
    label: t("survey.form.tab.publish"),
    icon: Icon.Publish,
    type: "publish"
  },
  {
    label: t("survey.form.tab.stat"),
    icon: Icon.Stats,
    type: "stat"
  }
]);

const selectSideItemType = (type: string) => {
  emit("selectSideItemType", type);
};
</script>

<style scoped lang="scss">
.sidebar {
  width: 55px;
  font-size: 12px;
  color: #314666;
  border-right: 1px solid rgb(232 235 238);
}
.item {
  display: block;
  height: 70px;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  filter: grayscale(100%);
  &.active {
    filter: grayscale(0%);
    .label {
      color: #1677ff;
    }
  }
  .icon {
    display: inline-block;
    width: 20px;
  }
  .label {
    height: 20px;
    margin-top: 2px;
    line-height: 20px;
  }
}
</style>
