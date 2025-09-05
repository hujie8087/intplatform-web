<template>
  <div class="">发布</div>
</template>

<script setup lang="ts" name="publish">
import { ref } from "vue";

const count = ref(0);

function increment() {
  count.value++;
}
increment();
</script>

<style scoped></style>
