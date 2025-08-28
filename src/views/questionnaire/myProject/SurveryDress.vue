<template>
  <div class="main-box">答卷地址</div>
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
.main-box {
  padding: 0;
}
</style>
