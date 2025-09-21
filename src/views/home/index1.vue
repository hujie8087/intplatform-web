<template>
  <div class="home card" v-if="isShow">
    <img class="home-bg" src="@/assets/images/welcome.png" alt="welcome" />
  </div>
  <dataVisualize v-else />
</template>

<script setup lang="ts" name="home">
import dataVisualize from "@/views/dashboard/dataVisualize/index.vue";
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/modules/auth";

const isShow = ref(true);

const authStore = useAuthStore();
const currentPageRoles = authStore.authButtonListGet ?? [];
const all_permission = "*:*:*";

onMounted(() => {
  console.log(authStore.authMenuList);
  if (currentPageRoles.includes(all_permission) || currentPageRoles.includes("home:data:visualize")) {
    isShow.value = false;
  }
});
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
