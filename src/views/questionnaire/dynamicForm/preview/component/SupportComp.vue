<template>
  <div class="support-content">
    <div class="support">
      <!-- <LogoIcon :size="18" /> -->
      <span class="des"> 2025 © iwip后勤管理综合服务平台 技术支持：信息技术部 </span>
    </div>
  </div>
</template>
<script setup lang="ts"></script>

<style scoped lang="scss">
.support-content {
  position: relative;
  height: 100px;
  font-size: 12px;
  line-height: 100px;
  color: #8f959e;
  text-align: center;
  .support {
    img {
      margin-top: -3px;
    }
    .des {
      padding-top: 1px;
      padding-left: 8px;
    }
  }
}
</style>
