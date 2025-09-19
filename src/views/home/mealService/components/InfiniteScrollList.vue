<template>
  <div class="list-container" ref="containerRef">
    <!-- 车拖动的组件 -->
    <div class="car-list" ref="listRef" @scroll="onScroll">
      <div class="list-content">
        <!-- spacer 保持 -->
        <div class="spacer" :style="{ height: spacerPx }" />

        <div
          v-for="(car, idx) in carList"
          :key="car.value ?? idx"
          class="car-item"
          :class="{
            focused: idx === previewIndex,
            active: idx === selectedIndex
          }"
          :style="{ height: itemPx, lineHeight: itemPx }"
          @click="clickItem(idx)"
        >
          {{ car.label }}
        </div>

        <div class="spacer" :style="{ height: spacerPx }" />
      </div>
    </div>

    <div class="glow-circle">
      <div class="outer-circle"></div>
    </div>

    <div class="pointer"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from "vue";

type Car = { label: string; value: string | number };

const props = defineProps({
  carList: { type: Array as () => Car[], required: true },
  itemHeight: { type: Number, default: 40 },
  modelValue: { type: [String, Number], default: null }
});

const containerRef = ref<HTMLElement | null>(null);
const listRef = ref<HTMLElement | null>(null);
const emit = defineEmits(["update:modelValue", "change"]);

const itemH = props.itemHeight ?? 40;
const itemPx = `${itemH}px`;

const previewIndex = ref(-1);
const selectedIndex = ref(-1);

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const spacerHeight = ref(0);
const spacerPx = computed(() => `${spacerHeight.value}px`);

const updateSpacer = () => {
  const el = listRef.value;
  if (!el) return;
  spacerHeight.value = Math.max(0, (el.clientHeight - itemH) / 2);
};

const calcPreviewIndex = () => {
  const el = listRef.value;
  if (!el || !props.carList.length) return -1;
  const scrollTop = el.scrollTop;
  const pointerPosition = el.clientHeight / 2;
  const pointerAbsolute = scrollTop + pointerPosition;
  const relative = pointerAbsolute - spacerHeight.value;
  // const idx = Math.round(relative / itemH);
  // return clamp(idx, 0, props.carList.length - 1);
  let idx = Math.floor(relative / itemH); // 🔥 改成 floor，避免跳两格
  // 🔥 边界修正：确保第一个能滚到
  if (scrollTop <= 0) {
    idx = 0;
  }
  return clamp(idx, 0, props.carList.length - 1);
};

// ⭐ 修改点 1：scrollToCenter 增加 snapping 锁，避免 click 和 scroll 竞争
const scrollIndexToCenter = async (idx: number, behavior: ScrollBehavior = "smooth") => {
  await nextTick();
  const el = listRef.value;
  if (!el) return;
  const itemCenter = spacerHeight.value + idx * itemH + itemH / 2;
  const pointerPosition = el.clientHeight / 2;
  let targetScrollTop = itemCenter - pointerPosition;
  const maxScrollTop = Math.max(0, el.scrollHeight - el.clientHeight);
  targetScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));

  el.scrollTo({ top: targetScrollTop, behavior });
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), behavior === "smooth" ? 420 : 50);
  });
};
// 🔥 新增：滚动到中间位置（没有选中项时使用）
const scrollToMiddle = async (behavior: ScrollBehavior = "smooth") => {
  if (!props.carList.length) return;
  const middleIndex = Math.floor(props.carList.length / 2);
  await scrollIndexToCenter(middleIndex, behavior);
  previewIndex.value = middleIndex;
};
let scrollTimer: number | null = null;
let snapping = false;

const onScroll = () => {
  const el = listRef.value;
  if (!el || !props.carList.length) return;
  if (snapping) return; // ⭐ 修改点 2：snapping 时忽略 scroll

  const newPreviewIndex = calcPreviewIndex();
  if (newPreviewIndex >= 0 && newPreviewIndex !== previewIndex.value) {
    previewIndex.value = newPreviewIndex;
  }

  if (scrollTimer) window.clearTimeout(scrollTimer);
  scrollTimer = window.setTimeout(() => {
    if (snapping) return;
    snapping = true;
    // const targetIdx = calcPreviewIndex();
    // scrollIndexToCenter(targetIdx, "smooth").then(() => {
    //   previewIndex.value = targetIdx;
    //   setTimeout(() => {
    //     snapping = false; // ⭐ 修改点 3：延迟释放 snapping，防止闪烁
    //   }, 120);
    // });
    // 🔥 直接对当前 previewIndex 吸附，避免抖动
    const targetIdx = previewIndex.value;
    scrollIndexToCenter(targetIdx, "smooth").then(() => {
      previewIndex.value = targetIdx;
      setTimeout(() => {
        snapping = false;
      }, 120);
    });
  }, 180);
};

const clickItem = (idx: number) => {
  selectedIndex.value = idx;
  const cur = props.carList[idx];
  emit("update:modelValue", cur.value);
  emit("change", cur);
  snapping = true;
  scrollIndexToCenter(idx, "smooth").then(() => {
    previewIndex.value = idx;
    setTimeout(() => {
      snapping = false;
    }, 120);
  });
};
// 🔥 修复：重置选中状态的函数
const resetSelection = () => {
  selectedIndex.value = -1;
  scrollToMiddle("smooth");
};

watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    // 🔥 关键修复：当 modelValue 从有值变为空字符串或 null 时，重置选中状态
    if (newValue === "" || newValue === null || newValue === undefined) {
      resetSelection();
      return;
    }
    const idx = props.carList.findIndex(c => c.value === newValue);
    if (idx !== -1) {
      selectedIndex.value = idx;
      scrollIndexToCenter(idx, "auto").then(() => {
        previewIndex.value = idx;
      });
    } else {
      // 如果找不到对应的值，也重置选中状态
      resetSelection();
    }
    console.log(oldValue);
  },
  { immediate: true }
);

watch(
  () => [props.carList.length, props.itemHeight],
  () => {
    updateSpacer();
    // 🔥 当车辆列表变化时，如果没有选中项，滚动到中间
    nextTick(() => {
      if (selectedIndex.value === -1 && props.carList.length > 0) {
        scrollToMiddle("auto");
      }
    });
  }
);

let ro: ResizeObserver | null = null;
onMounted(() => {
  nextTick(() => {
    const el = listRef.value;
    updateSpacer();
    if (el && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => updateSpacer());
      ro.observe(el);
    }
    if (props.modelValue == null && props.carList.length) {
      scrollIndexToCenter(0, "auto").then(() => {
        previewIndex.value = 0;
      });
    }
    // 🔥 修复：初始化时根据 modelValue 决定显示位置
    if (props.modelValue == null || props.modelValue === "") {
      if (props.carList.length > 0) {
        scrollToMiddle("auto");
      }
    }
  });
});
onUnmounted(() => {
  if (scrollTimer) window.clearTimeout(scrollTimer);
  if (ro && listRef.value) ro.unobserve(listRef.value);
  ro = null;
});
</script>

<style scoped>
.list-container {
  position: relative;
  height: 100%;
  overflow: hidden;
}
.car-list {
  height: 100%;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.car-list::-webkit-scrollbar {
  display: none;
}
.list-content {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.spacer {
  flex: 0 0 auto;
  width: 100%;
}
.car-item {
  font-size: 16px;
  color: #999999;
  text-align: center;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
}

/* ⭐ 修改点 4：去掉背景，只保留文字高亮与 glow */
.car-item.active {
  font-size: 18px;
  font-weight: bold;
  color: #00d2ff;
}
.car-item.focused {
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 0 10px rgb(255 255 255 / 80%);
}
.car-item.focused.active {
  font-size: 18px;
  color: #00fff7;
  text-shadow: 0 0 15px rgb(0 255 247 / 80%);
}
.pointer {
  position: absolute;
  top: 50%;
  right: 6px;
  z-index: 10;
  width: 0;
  height: 0;
  pointer-events: none;
  filter: drop-shadow(0 0 7px #ffd700);
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 12px solid #ffd700;
  transform: translateY(-50%) rotate(180deg);
}
.glow-circle {
  position: absolute;
  top: 50%;
  left: 6px;
  z-index: 10;
  box-sizing: border-box;
  width: 18px;
  height: 18px;
  pointer-events: none;
  filter: drop-shadow(0 0 5px #00fff7);
  border: 2px solid #00d2ff;
  border-radius: 50%;
  box-shadow: inset 0 0 3px 0 #00fff7;
  transform: translateY(-50%);
}
.outer-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  background: radial-gradient(
    circle,
    rgb(255 255 255 / 100%) 0%,
    rgb(255 255 255 / 70%) 50%,
    rgb(255 255 255 / 30%) 80%,
    rgb(255 255 255 / 0%) 100%
  );
  border-radius: 50%;
  box-shadow: 0 0 30px rgb(255 255 255 / 50%);
  transform: translate(-50%, -50%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.7;
    transform: translate(-50%, -50%) scale(1.1);
  }
}
</style>
