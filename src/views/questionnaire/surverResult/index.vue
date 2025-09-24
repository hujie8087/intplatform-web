<template>
  <div class="surver-result">
    <div class="topic-page-container" ref="scrollBox">
      <div class="body-content">
        <div class="topic-list comps">
          <el-watermark :font="{ fontSize: 20 }" :content="selectForm?.displayWaterMark ? selectForm?.waterMarkText || '' : ''">
            <div v-for="item in pageCompList" :key="item?.id" class="cursor-move form-item cannot-click">
              <FormComponent
                v-if="!['paging'].includes(item.type) || (['paging'].includes(item.type) && formShowConfig.displayPaging)"
                :render-type="'preview'"
                :key="item.id + previewType"
                :component="item"
                :type="item.type"
                :is-dev="item?.isDev ?? false"
                :form-config="selectForm"
                :preview-type="previewType"
                :is-preview-render="true"
              >
              </FormComponent>
            </div>
          </el-watermark>
        </div>
      </div>
    </div>
    <el-icon v-show="showBackTop" class="back-top-btn" @click="backToTop"><ArrowUp /></el-icon>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { ArrowUp } from "@element-plus/icons-vue";
import FormComponent from "../dynamicForm/components/componentsForm/index.vue";
import { getSurveyResult } from "@/api/modules/questionnaire/surverResult";
import { useRoute } from "vue-router";
const selectForm = ref();
const route = useRoute();
const pageCompList = ref();
const scrollBox = ref<HTMLElement>();
const showBackTop = ref(false);
// 回到顶部
const backToTop = () => {
  scrollBox.value?.scrollTo({ top: 0, behavior: "smooth" });
};
// 监听页面滚动
const handleScroll = () => {
  if (!scrollBox.value) return;
  showBackTop.value = scrollBox.value.scrollTop > 300;
};

onMounted(async () => {
  const projectKey = route.query?.projectKey as string;
  const id = route.query?.id as string;
  let result: any = await getSurveyResult({ id, projectKey });
  pageCompList.value = [];
  result.data.itemAnswerList.forEach(item => {
    pageCompList.value.push(item.expand);
  });
  scrollBox.value?.addEventListener("scroll", handleScroll);
});
onBeforeUnmount(() => {
  scrollBox.value?.removeEventListener("scroll", handleScroll);
});
</script>

<style lang="scss" scoped>
.surver-result {
  position: relative;
  width: 100%;
  height: 100%;
  &::before {
    position: absolute;
    inset: 0;
    content: "";
    background: url("../myProject/components/images/bg.jpg") center center;
    filter: blur(8px);
    background-size: cover;
  }
  .topic-page-container {
    position: relative;
    width: 55%;
    height: 100%;
    margin: 0 auto;
    overflow: auto;
    background: #ffffff;
  }
  .cannot-click {
    pointer-events: none;
    cursor: not-allowed;
  }
}
.back-top-btn {
  position: fixed;
  right: 16%; // 调整到右下角
  bottom: 8%;
  z-index: 999;
  padding: 8px;
  font-size: 28px;
  color: #409eff; // Element 默认蓝色
  cursor: pointer;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
  transition: all 0.3s;
  &:hover {
    color: #66b1ff;
    transform: translateY(-3px);
  }
}
</style>
