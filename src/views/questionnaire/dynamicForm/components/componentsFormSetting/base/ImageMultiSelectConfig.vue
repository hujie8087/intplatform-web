<template>
  <div class="setting-item">
    <el-text size="default" class="block-title">多图设置</el-text>
    <div class="setting-item-img">
      <el-text size="small" class="add-title" @click="addItem">
        <el-icon><Plus /></el-icon>添加选项
      </el-text>
      <el-text size="small" class="add-title" style="margin-left: 16px" @click="editImages">
        <el-icon><Edit /></el-icon>修改选项
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
              <span class="label"> {{ element?.value }}</span>
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
  <el-dialog v-model="dialogVisible" title="图片配置" width="35%">
    <div class="setting-container">
      <el-empty v-if="comp.dataList.length < 1" description="暂无数据" />
      <div v-else class="list-item" v-for="(item, index) in comp.dataList" :key="index">
        <el-input
          style="width: 380px; margin-bottom: 10px"
          class="title-input"
          show-word-limit
          maxlength="50"
          placeholder="请输入标题名称"
          v-model="item.label"
          @input="item.value = item.label"
          size="default"
        ></el-input>
        <UploadImg class="img-upload" v-model:image-url="item.imageUrl" :file-size="5" width="90px" height="90px">
          <template #tip>
            <span class="upload-tip">上传图片最大为 5M</span>
          </template>
        </UploadImg>
        <el-input class="desc-textarea" type="textarea" v-model="item.desc" placeholder="请输入简介" size="default"></el-input>
        <el-icon class="del-icon" @click="delItem(index)"><Remove /></el-icon>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false"> 关闭 </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import UploadImg from "@/components/Upload/Img.vue";
import { v4 as uuidv4 } from "uuid";
// import { useSelectCompStore } from "@/stores/modules/selectCompStore";
interface Props {
  comp: any;
}
const dialogVisible = ref(false);
const imageData = ref({
  label: "标题",
  value: "标题",
  desc: "描述",
  imageUrl: ""
});

// 添加列表
const addItem = () => {
  comp.value.dataList.push({ ...imageData.value, id: uuidv4() });
};

// 删除项目
const delItem = index => {
  comp.value.dataList.splice(index, 1);
};
// 修改图片
const editImages = () => {
  dialogVisible.value = true;
};
const props = defineProps<Props>();
const comp = ref(props.comp);
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

// 内容区域样式
.setting-container {
  .list-item {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 10px;
    margin-bottom: 10px;
    background-color: rgb(240 248 255) !important;
    border-radius: 8px;
    transition: all 0.25s ease;
    &:hover {
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 5%);
    }
    .title-input {
      width: 100%;
    }
    .img-upload {
      align-self: flex-start; // 图片左对齐
      .upload-tip {
        display: block;
        margin-top: 6px;
        font-size: 12px;
        text-align: left;
      }
    }
    .desc-textarea {
      width: 100%;
      resize: vertical;
    }
    .del-icon {
      align-self: flex-end;
      margin-top: 6px;
      font-size: 18px;
      color: #ef4444;
      cursor: pointer;
      transition: all 0.2s;
      &:hover {
        color: #dc2626;
        transform: scale(1.05);
      }
    }
  }
}
</style>
