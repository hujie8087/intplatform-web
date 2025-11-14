<template>
  <div
    class="floating-chat-button"
    :style="{ bottom: buttonPosition.bottom + 'px' }"
    @mousedown="startDrag"
    @touchstart="startDrag"
    @click="handleClick($event)"
  >
    <el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0">
      <div class="chat-icon">
        <el-icon size="24px"><ChatDotRound /></el-icon>
      </div>
    </el-badge>
  </div>
  <!-- 客服聊天组件 -->
  <!-- <CustomerChat v-model="chatVisible" v-if="chatVisible" @close="handleChatClose" /> -->
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { ChatDotRound } from "@element-plus/icons-vue";
// import CustomerChat from "./";
import { useChatStore } from "@/stores/modules/chat";

const chatVisible = ref(false);
const chatStore = useChatStore();

// 使用store中的未读消息数量
const unreadCount = computed(() => chatStore.unreadCount);
const triggerTimer = ref(null);

// 拖动相关状态
const buttonPosition = ref({ bottom: 80 }); // 初始位置
const isDragging = ref(false);
const hasDragged = ref(false); // 标记是否真正发生了拖拽
const dragStartY = ref(0);
const dragStartBottom = ref(0);
const dragStartX = ref(0); // 添加 X 坐标记录
const DRAG_THRESHOLD = 3; // 降低拖拽阈值

// 强制清理拖拽状态和事件监听器
const forceStopDrag = () => {
  // 移除所有拖拽相关的事件监听器
  document.removeEventListener("mousemove", handleDrag);
  document.removeEventListener("mouseup", stopDrag);
  document.removeEventListener("touchmove", handleDrag);
  document.removeEventListener("touchend", stopDrag);

  // 重置所有拖拽状态
  isDragging.value = false;
  hasDragged.value = false;
};

// 拖动相关函数
const startDrag = (event: MouseEvent | TouchEvent) => {
  // 先清理可能残留的事件监听器
  forceStopDrag();

  event.stopPropagation();

  isDragging.value = true;
  hasDragged.value = false;

  // 获取初始位置
  const clientY = "touches" in event ? event.touches[0].clientY : event.clientY;
  const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;

  dragStartY.value = clientY;
  dragStartX.value = clientX;
  dragStartBottom.value = buttonPosition.value.bottom;

  // 添加全局事件监听
  document.addEventListener("mousemove", handleDrag, { passive: false });
  document.addEventListener("mouseup", stopDrag);
  document.addEventListener("touchmove", handleDrag, { passive: false });
  document.addEventListener("touchend", stopDrag);
};

const handleDrag = (event: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return;

  const clientY = "touches" in event ? event.touches[0].clientY : event.clientY;
  const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;

  // 计算总的移动距离
  const deltaY = Math.abs(dragStartY.value - clientY);
  const deltaX = Math.abs(dragStartX.value - clientX);
  const totalDelta = Math.sqrt(deltaY * deltaY + deltaX * deltaX);

  // 如果移动距离超过阈值，标记为已拖拽并阻止默认行为
  if (totalDelta > DRAG_THRESHOLD) {
    hasDragged.value = true;
    event.preventDefault();
  }

  // 只在真正拖拽时更新位置
  if (hasDragged.value) {
    const actualDeltaY = dragStartY.value - clientY; // 向上为正，向下为负
    const newBottom = dragStartBottom.value + actualDeltaY;

    // 限制拖动范围（距离顶部至少100px，距离底部至少20px）
    const minBottom = 20;
    const maxBottom = window.innerHeight - 100;

    buttonPosition.value.bottom = Math.max(minBottom, Math.min(maxBottom, newBottom));
  }
};

const stopDrag = () => {
  if (!isDragging.value) return;

  // 移除全局事件监听
  document.removeEventListener("mousemove", handleDrag);
  document.removeEventListener("mouseup", stopDrag);
  document.removeEventListener("touchmove", handleDrag);
  document.removeEventListener("touchend", stopDrag);

  // 如果发生了拖拽，保存位置
  if (hasDragged.value) {
    localStorage.setItem("chatButtonPosition", JSON.stringify(buttonPosition.value));
  }

  // 立即重置拖拽状态
  isDragging.value = false;

  // 延迟重置hasDragged状态，防止立即触发点击
  setTimeout(() => {
    hasDragged.value = false;
  }, 50);
};

// 处理点击事件
const handleClick = (event: Event) => {
  // 确保拖拽状态完全清理
  if (isDragging.value) {
    forceStopDrag();
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  // 如果刚刚拖拽过，阻止点击
  if (hasDragged.value) {
    event.preventDefault();
    event.stopPropagation();
    // 重置拖拽状态，为下次点击做准备
    setTimeout(() => {
      hasDragged.value = false;
    }, 100);
    return;
  }

  // 正常点击，打开聊天
  event.stopPropagation();
  openChat();
};

// 全局事件处理，确保在任何情况下都能重置状态
const handleGlobalMouseUp = () => {
  if (isDragging.value) {
    stopDrag();
  }
};

const handleGlobalTouchEnd = () => {
  if (isDragging.value) {
    stopDrag();
  }
};

// 处理窗口失焦时的清理
const handleWindowBlur = () => {
  if (isDragging.value) {
    forceStopDrag();
  }
};

// 打开聊天
const openChat = () => {
  if (triggerTimer.value) {
    return;
  }

  // 确保在打开聊天前完全清理拖拽状态
  forceStopDrag();

  chatVisible.value = true;
};

// 关闭聊天
// const handleChatClose = () => {
//   if (triggerTimer.value) {
//     clearTimeout(triggerTimer.value);
//   }
//   // triggerTimer.value = setTimeout(() => {
//   //   triggerTimer.value = false;
//   // }, 400);
//   console.log("客服聊天已关闭");
// };

onMounted(() => {
  chatStore.startUnreadPolling();

  // 从localStorage恢复按钮位置
  const savedPosition = localStorage.getItem("chatButtonPosition");
  if (savedPosition) {
    try {
      const position = JSON.parse(savedPosition);
      buttonPosition.value = position;
    } catch (error) {
      console.error("恢复按钮位置失败:", error);
    }
  }

  // 添加全局事件监听器
  document.addEventListener("mouseup", handleGlobalMouseUp);
  document.addEventListener("touchend", handleGlobalTouchEnd);
  window.addEventListener("blur", handleWindowBlur);
});

onUnmounted(() => {
  chatStore.stopUnreadPolling();

  // 强制清理所有拖拽相关状态和监听器
  forceStopDrag();

  // 移除全局监听器
  document.removeEventListener("mouseup", handleGlobalMouseUp);
  document.removeEventListener("touchend", handleGlobalTouchEnd);
  window.removeEventListener("blur", handleWindowBlur);
});

// 暴露方法供外部调用
defineExpose({
  openChat
});
</script>

<style scoped lang="scss">
.floating-chat-button {
  position: fixed;
  right: 30px;
  z-index: 3;
  cursor: move;
  user-select: none;
  .chat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    color: white;
    cursor: pointer;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    box-shadow: 0 4px 20px rgb(102 126 234 / 40%);
    transition: all 0.3s ease;
    &:hover {
      box-shadow: 0 6px 25px rgb(102 126 234 / 60%);
      transform: translateY(-2px);
    }
    &:active {
      transform: translateY(0);
    }
  }

  // 脉冲动画效果
  &::before {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 56px;
    height: 56px;
    content: "";
    background: rgb(102 126 234 / 30%);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  70% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.4);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.4);
  }
}

// 响应式设计
@media (width <= 768px) {
  .floating-chat-button {
    right: 20px;
    .chat-icon {
      width: 48px;
      height: 48px;
    }
    &::before {
      width: 48px;
      height: 48px;
    }
  }
}
</style>
