<template>
  <div class="comp-img"><img :src="getImageUrl(props.value)" :alt="props.alt" /></div>
</template>

<script setup lang="ts">
const filePath = import.meta.env.VITE_APP_BASE_FILE;
interface Props {
  id: string;
  value: string;
  alt?: string;
  isDev: boolean;
}
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
const props = defineProps<Props>();
</script>

<style lang="scss" scoped>
.comp-img {
  img {
    width: 100%;
  }
}
</style>
