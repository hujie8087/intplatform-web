<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="1080" :title="drawerProps.title">
    <el-tabs v-model="drawerProps.title">
      <el-tab-pane
        v-for="(value, key) in drawerProps.rowData"
        :label="key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'))"
        :name="key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'))"
        :key="value"
      >
        <!-- <el-link :underline="false" icon="DocumentCopy" v-copyText="value" style="float: right">&nbsp;复制</el-link> -->
        <el-button type="primary" v-copy="value" style="float: right"> 复制代码 </el-button>
        <pre>{{ value }}</pre>
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button type="primary" @click="drawerVisible = false">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="PreviewDrawer">
import { ref } from "vue";
// import { useI18n } from "vue-i18n";
import { Gen } from "@/api/interface/tool";
// const { t } = useI18n(); // 解构出t方法

interface DrawerProps {
  title: string;
  rowData?: Gen.Preview;
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: ""
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

defineExpose({
  acceptParams
});
</script>
