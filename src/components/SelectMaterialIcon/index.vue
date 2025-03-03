<template>
  <div class="icon-box">
    <el-input
      ref="inputRef"
      v-model="valueIcon"
      v-bind="$attrs"
      :placeholder="placeholder"
      :clearable="clearable"
      @clear="clearIcon"
      @click="openDialog"
    >
      <template #append>
        <!-- <el-button :icon="customIcons[iconValue]" /> -->
        <span class="material-icons">
          {{ iconValue }}
        </span>
      </template>
    </el-input>
    <el-dialog v-model="dialogVisible" :title="placeholder" top="50px" width="66%">
      <el-input v-model="inputValue" placeholder="搜索图标" size="large">
        <template #append>
          <span class="material-icons">search</span>
        </template>
      </el-input>
      <el-scrollbar v-if="Object.keys(iconsList).length">
        <div class="icon-list">
          <div v-for="item in Object.keys(iconsList)" :key="item" class="icon-item" @click="selectIcon(item)">
            <!-- <component :is="item.content"></component> -->
            <div class="material-icons" style="margin-bottom: 5px">{{ item }}</div>
            <div>{{ item }}</div>
          </div>
        </div>
      </el-scrollbar>
      <el-empty v-else description="未搜索到您要找的图标~" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="SelectMaterialIcon">
import { computed, ref } from "vue";
import * as Icons from "@/assets/json/materialIcons.json";

interface SelectIconProps {
  iconValue: string;
  title?: string;
  clearable?: boolean;
  placeholder?: string;
}

const props = withDefaults(defineProps<SelectIconProps>(), {
  iconValue: "",
  title: "请选择图标",
  clearable: true,
  placeholder: "请选择图标"
});

// 重新接收一下，防止打包后 clearable 报错
const valueIcon = ref(props.iconValue);

// open Dialog
const dialogVisible = ref(false);
const openDialog = () => (dialogVisible.value = true);

// 选择图标(触发更新父组件数据)
const emit = defineEmits<{
  "update:iconValue": [value: string];
}>();
const selectIcon = (item: any) => {
  dialogVisible.value = false;
  valueIcon.value = item;
  emit("update:iconValue", item);
  setTimeout(() => inputRef.value.blur(), 0);
};

// 清空图标
const inputRef = ref();
const clearIcon = () => {
  valueIcon.value = "";
  emit("update:iconValue", "");
  setTimeout(() => inputRef.value.blur(), 0);
};

// 监听搜索框值
const inputValue = ref("");
const customIcons: { [key: string]: any } = Icons;

const iconsList = computed((): { [key: string]: any } => {
  if (!inputValue.value) return Icons;
  let result: { [key: string]: any } = {};
  for (const key in customIcons) {
    if (key.toLowerCase().indexOf(inputValue.value.toLowerCase()) > -1) result[key] = customIcons[key];
  }
  return result;
});
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
