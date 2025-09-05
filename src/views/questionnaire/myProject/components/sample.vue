<template>
  <div class="">样本</div>
</template>

<script setup lang="ts" name="sample">
import { ref } from "vue";

const count = ref(0);

function increment() {
  count.value++;
}
increment();
</script>

<style scoped lang="scss"></style>
