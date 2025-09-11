<template>
  <div class="setting-item">
    <el-text size="default" class="block-title">多图设置</el-text>
    <div class="setting-item-img">
      <el-text size="small" class="add-title" @click="addItem">
        <el-icon><Plus /></el-icon>添加选项
      </el-text>
    </div>
  </div>

  <div class="setting-item">
    <div class="setting-item-list">
      <draggable
        v-if="comp.dataList.length"
        class="flex flex-col gap-2 p-4 w-300px bg-gray-500/5 rounded compList"
        :list="comp.dataList"
        :animation="150"
        :sort="true"
        ghost-class="ghost"
        handle=".handle"
        item-key="id"
      >
        <!-- 使用item插槽来定义可拖拽项 -->
        <template #item="{ element, index }">
          <div
            :key="element.id || index"
            :class="{
              'cursor-move': true,
              'form-item': true
            }"
          >
            <div class="active-drag handle">
              <img src="/src/assets/images/form-editor/drag.svg" alt="" />
              <div class="list-item">
                <el-input placeholder="请输入标题名称" size="default"></el-input>
                <UploadImg class="img-upload" v-model:image-url="imageUrl" :file-size="5" width="50px" height="50px">
                  <template #tip>
                    <span style="float: left">上传图片最大为 5M</span>
                  </template>
                </UploadImg>
                <el-input type="textarea" placeholder="请输入简介" size="default"></el-input>
                <el-icon class="del"><Remove /></el-icon>
              </div>
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch } from "vue";
import UploadImg from "@/components/Upload/Img.vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
interface Props {
  comp: any;
}

const imageData = ref({
  label: "",
  value: "",
  id: "",
  imageUrl: ""
});

// 添加列表
const addItem = () => {
  comp.value.dataList.push(imageData.value);
  console.log(comp.value.dataList, "dataList");
};

const compStore: any = useSelectCompStore();
const props = defineProps<Props>();
const comp = ref(props.comp);

const imageUrl = ref(props.comp.value);
watch(imageUrl, newValue => {
  compStore.updateCurrentComp({
    value: newValue
  });
});
</script>
<style lang="scss" scoped>
.comp {
  padding: 10px;
  color: yellowgreen;
}
.mb-10 {
  margin-bottom: 10px;
}
.setting-item-img {
  display: flex;
  margin-bottom: 10px;
  .add-title {
    color: rgb(22 119 255);
    cursor: pointer;
  }
}
.setting-item-list {
  display: flex;
  flex-direction: column;
  .list-item {
    position: relative;
    .del {
      position: absolute;
      top: 60px;
      right: 10px;
      color: red;
    }
    .img-upload {
      margin: 10px 0;
    }
  }
}
</style>
