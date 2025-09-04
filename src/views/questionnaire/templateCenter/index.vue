<template>
  <div class="template-center">模版中心</div>
</template>

<script setup>
import { ref } from "vue";

const count = ref(0);

function increment() {
  count.value++;
}
increment();
</script>

<style scoped>
.template-center {
  padding: 16px;
}
</style>
