<template>
  <div class="form-header">
    <div class="header-img" v-if="props.titleImageShow">
      <img :src="getImageUrl(props.titleImageUrl)" />
    </div>
    <div class="title-section" :style="computedStyle">
      <div
        class="title"
        :style="{
          marginTop: props.titleSize === 'large' ? '16px' : props.titleSize === 'middle' ? '10px' : '6px',
          marginBottom: props.titleSize === 'large' ? '16px' : props.titleSize === 'middle' ? '10px' : '6px'
        }"
      >
        <div
          class="title-val"
          :style="{
            fontSize: props.titleSize === 'large' ? '36px' : props.titleSize === 'middle' ? '24px' : '18px',
            lineHeight: props.titleSize === 'large' ? '40px' : props.titleSize === 'middle' ? '28px' : '22px'
          }"
        >
          {{ props.titleValue }}
        </div>
      </div>
      <div class="description" v-if="props.titleDescriptionShow">
        <div
          class="description-value"
          :style="{
            ...computedStyle,
            fontSize: props.titleSize === 'large' ? '16px' : props.titleSize === 'middle' ? '14px' : '12px'
          }"
        >
          {{ props.titleDescription }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, computed } from "vue";
import type { CSSProperties } from "vue";
interface Props {
  id: string;
  placeholder: string;
  titleImageShow: boolean;
  titleImageUrl: string;
  titleValue: string;
  titleSize: string;
  titleDescriptionShow: boolean;
  titleDescription: string;
  titleDescriptionPosition: string;
  titleDescriptionSize: string;
  titleDescriptionColor: string;
  titleDescriptionFontWeight: string;
  titleDescriptionFontStyle: string;
  value: string;
  isDev: boolean;
}
const props = defineProps<Props>();
const computedStyle = computed(() => {
  return {
    textAlign: props.titleDescriptionPosition || "center"
  } as CSSProperties;
});
const getImageUrl = (imgUrl: string) => {
  try {
    return new URL(`/src/assets/images/form-editor/${imgUrl}`, import.meta.url).href;
  } catch (e) {
    const defaultUrl = props?.defUrl;
    return new URL(`/src/assets/form-editor/${defaultUrl}`, import.meta.url).href;
  }
};
onMounted(() => {
  if (props.isDev) {
    console.log("formTitle mounted with props:", props);
  }
});
</script>

<style lang="scss" scoped>
.header-img {
  img {
    width: 100%;
  }
}
.title-section {
  margin: 30px 0 5px;
  .title {
    margin: 10px 0 !important;
  }
  .description {
    color: rgb(0 0 0 / 45%);
  }
}
</style>
