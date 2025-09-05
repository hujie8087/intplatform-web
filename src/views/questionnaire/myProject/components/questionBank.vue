<template>
  <div class="kkkk">题库页面</div>
</template>

<script setup lang="ts" name="questionBank">
import { ref } from "vue";

const count = ref(0);

function increment() {
  count.value++;
}
increment();
</script>

<style scoped lang="scss"></style>
