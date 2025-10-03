<template>
  <div class="comp-img">
    <el-image :src="getImageUrl(props.dataValue)">
      <template #error>
        <div class="image-slot">
          <el-icon style="font-size: 80px"><icon-picture /></el-icon>
        </div>
      </template>
    </el-image>
    <el-button v-if="isDev" @click="dialogVisible = true" type="primary">选择问卷回复</el-button>
    <el-dialog v-model="dialogVisible" :style="{ top: `${editorScrollInfo.scrollTop}px` }" title="历史问卷回复" width="500">
      <div class="item-container">
        <!-- 元素1 -->
        <div
          class="item-card"
          :class="{ selected: selectedItem?.id === item.id }"
          v-for="item in items"
          :key="item.id"
          @click="selectItem(item)"
        >
          <div class="item-content">
            <el-image
              style="width: 100%; height: 220px"
              src="https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg"
              :zoom-rate="1.2"
              :max-scale="7"
              :min-scale="0.2"
              show-progress
              :initial-index="4"
              fit="cover"
            />
            <h3 class="item-title">2025年8月数据调研/回复</h3>
            <p class="item-description">这是第一个元素的描述内容，使用纯外部CSS实现布局</p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="selectData"> 选择 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Picture as IconPicture } from "@element-plus/icons-vue";

const filePath = import.meta.env.VITE_APP_BASE_FILE;
interface Props {
  id: string;
  dataValue: string;
  alt?: string;
  isDev: boolean;
  editorScrollInfo: any;
}
const defUrl = "";
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
const props = defineProps<Props>();
const dialogVisible = ref(false);
// 定义卡片数据
const items = [
  {
    id: 1,
    title: "元素一",
    description: "点击选中，再次点击仍保持选中",
    icon: "fa-cube",
    colorClass: "icon-blue"
  },
  {
    id: 2,
    title: "元素二",
    description: "选中后自动取消其他选中项",
    icon: "fa-cubes",
    colorClass: "icon-green"
  },
  {
    id: 3,
    title: "元素三",
    description: "Vue3响应式数据控制选中状态",
    icon: "fa-codepen",
    colorClass: "icon-purple"
  },
  {
    id: 4,
    title: "元素四",
    description: "支持单选模式的卡片布局",
    icon: "fa-cog",
    colorClass: "icon-yellow"
  },
  {
    id: 5,
    title: "元素五",
    description: "通过v-for动态渲染所有卡片",
    icon: "fa-calculator",
    colorClass: "icon-red"
  }
];

// 选中项的响应式数据
const selectedItem = ref(null);
// 选中项目的方法
const selectItem = item => {
  // 实现单选逻辑：选中当前项，取消其他项
  selectedItem.value = item;
  // 可以在这里添加选中后的其他业务逻辑
  console.log("选中了:", item.title);
};

const selectData = () => {
  dialogVisible.value = false;
};
</script>

<style lang="scss" scoped>
.comp-img {
  box-sizing: border-box;
  display: inline-block;
  width: 100%;
  text-align: center;
  vertical-align: top;
}
.comp-img .el-image {
  width: 100%;
  padding: 0 5px;
}
.comp-img .image-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 10px 0;
  font-size: 30px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
}
.comp-img .image-slot .el-icon {
  font-size: 30px;
}

/* 布局容器 */
.item-container {
  display: flex;
  flex-wrap: wrap;
  height: 400px;
  margin: 0 -1rem;
  overflow: auto;
}

/* 项目卡片样式 */
.item-card {
  width: 100%;
  padding: 0 1rem;
  margin-top: 10px;
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.item-card:hover {
  transform: translateY(-3px);
}
.item-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  text-align: center;
  background-color: white;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgb(0 0 0 / 10%);
  transition: all 0.3s ease;
}

/* 选中状态样式 */
.item-card.selected .item-content {
  border-color: #2563eb;
  box-shadow:
    0 0 0 3px rgb(37 99 235 / 20%),
    0 4px 6px rgb(0 0 0 / 10%);
}
.item-title {
  margin-bottom: 10px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}
.item-description {
  color: #6b7280;
}
</style>
