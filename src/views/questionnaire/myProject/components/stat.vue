<template>
  <div class="">统计页面</div>
</template>

<script setup lang="ts" name="setting">
import { ref } from "vue";

const count = ref(0);

function increment() {
  count.value++;
}
increment();
</script>

<style scoped lang="scss"></style>
