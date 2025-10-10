<template>
  <div class="comp-img">
    <el-image class="img_box" :src="getImageUrl(props.value)">
      <template #error>
        <div class="image-slot">
          <el-icon style="font-size: 80px"><icon-picture /></el-icon>
        </div>
      </template>
    </el-image>

    <el-button style="margin-top: 10px" v-if="isDev && !props.value" @click="openDialog" type="primary">{{
      $t("survey.form.replyComp.selectReply")
    }}</el-button>
    <el-dialog
      v-model="dialogVisible"
      :style="{ top: `${editorScrollInfo.scrollTop}px` }"
      :title="$t('survey.form.replyComp.historyReply')"
      width="500"
    >
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
              :src="item.fullUrl"
              :zoom-rate="1.2"
              :max-scale="7"
              :min-scale="0.2"
              show-progress
              :initial-index="4"
              fit="cover"
            />
            <h3 class="item-title">《{{ item.projectName }}》</h3>
            <p class="item-description">{{ item.title }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ $t("main.cancel") }}</el-button>
          <el-button type="primary" @click="selectData"> {{ $t("main.confirm") }} </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Picture as IconPicture } from "@element-plus/icons-vue";
import { getSurveyReply } from "@/api/modules/questionnaire/surveyReply";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
import { delayTime } from "../../compConfig";
const compStore = useSelectCompStore();

const filePath = import.meta.env.VITE_APP_BASE_FILE;
interface Props {
  id: string;
  value: string;
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
const items = ref([]);

// 选中项的响应式数据
const selectedItem = ref(null);
// 选中项目的方法
const selectItem = item => {
  // 实现单选逻辑：选中当前项，取消其他项
  selectedItem.value = item;
};

const selectData = () => {
  dialogVisible.value = false;
  // 修改数据
  setTimeout(() => {
    compStore.updateCurrentComp({ value: selectedItem.value?.url, id: props.id });
  }, delayTime);
};

const openDialog = () => {
  dialogVisible.value = true;
  getSurveyReplyList();
};

const getSurveyReplyList = async () => {
  const res = await getSurveyReply({ pageSize: 999 });
  if (res?.code == 200) {
    res?.rows.forEach(element => {
      element.fullUrl = filePath + element.url;
    });
    items.value = res.rows;
  }
};
</script>

<style lang="scss" scoped>
.comp-img {
  position: relative;
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
.img_box {
  display: block;
  width: 100%;
  height: auto;
  cursor: pointer;
}
</style>
