<template>
  <div class="text-message">
    {{ content }}
  </div>
</template>

<script setup lang="ts">
interface Props {
  /** 消息内容 */
  content: string;
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
.text-message {
  // 宽度为文本宽度
  width: fit-content;
  font-size: 12px;
  word-break: break-word;
  white-space: pre-wrap;
}
</style>
