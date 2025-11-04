import { ref, nextTick } from "vue";
import { emitter } from "@/utils/mitt";

/**
 * 滚动控制 Composable
 * 统一处理聊天消息列表的滚动逻辑
 */
export function useScrollControl() {
  const scrollbarRef = ref();
  const showScrollToBottom = ref(false);
  const newMessageCount = ref(0);
  const isScrolling = ref(false);
  const shouldAutoScroll = ref(true);

  /**
   * 滚动到底部
   */
  const scrollToBottom = () => {
    nextTick(() => {
      emitter.emit("scrollToBottomForMessageList" as any);
      // if (scrollbarRef.value?.wrapRef) {
      //   setTimeout(() => {
      //     const wrapEl = scrollbarRef.value.wrapRef
      //     wrapEl.scrollTop = wrapEl.scrollHeight
      //     showScrollToBottom.value = false
      //     newMessageCount.value = 0
      //     shouldAutoScroll.value = true
      //   }, 100);
      // }
    });
  };

  /**
   * 滚动到底部（新消息时）
   */
  const scrollToBottomForNewMessage = () => {
    // 只有在用户没有主动向上滚动时才自动滚动到底部
    if (shouldAutoScroll.value) {
      scrollToBottom();
    } else {
      newMessageCount.value++;
      showScrollToBottom.value = true;
    }
  };

  /**
   * 处理滚动事件
   */
  const handleScroll = () => {
    if (!scrollbarRef.value?.wrapRef) return;

    const wrapEl = scrollbarRef.value.wrapRef;
    const { scrollTop, scrollHeight, clientHeight } = wrapEl;

    isScrolling.value = true;

    // 判断是否接近底部（允许一定的误差）
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    shouldAutoScroll.value = isNearBottom;

    // 如果滚动到底部，隐藏滚动到底部按钮
    if (isNearBottom) {
      showScrollToBottom.value = false;
      newMessageCount.value = 0;
    } else {
      showScrollToBottom.value = true;
    }

    // 防抖处理，滚动结束后重置状态
    setTimeout(() => {
      isScrolling.value = false;
    }, 150);
  };

  /**
   * 滚动到指定位置
   */
  const scrollToPosition = (position: number) => {
    if (scrollbarRef.value?.wrapRef) {
      scrollbarRef.value.wrapRef.scrollTop = position;
    }
  };

  /**
   * 平滑滚动到底部
   */
  const smoothScrollToBottom = () => {
    if (!scrollbarRef.value?.wrapRef) return;

    const wrapEl = scrollbarRef.value.wrapRef;
    const targetScrollTop = wrapEl.scrollHeight;
    const currentScrollTop = wrapEl.scrollTop;
    const distance = targetScrollTop - currentScrollTop;
    const duration = 300; // 动画持续时间
    const startTime = Date.now();

    const animateScroll = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // 使用缓动函数
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOutCubic(progress);

      wrapEl.scrollTop = currentScrollTop + distance * easedProgress;

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        showScrollToBottom.value = false;
        newMessageCount.value = 0;
        shouldAutoScroll.value = true;
      }
    };

    requestAnimationFrame(animateScroll);
  };

  /**
   * 检查是否在底部
   */
  const isAtBottom = (threshold: number = 100): boolean => {
    if (!scrollbarRef.value?.wrapRef) return true;

    const wrapEl = scrollbarRef.value.wrapRef;
    const { scrollTop, scrollHeight, clientHeight } = wrapEl;
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  /**
   * 重置滚动状态
   */
  const resetScrollState = () => {
    showScrollToBottom.value = false;
    newMessageCount.value = 0;
    isScrolling.value = false;
    shouldAutoScroll.value = true;
  };

  /**
   * 保存滚动位置（用于加载更多消息时保持位置）
   */
  const saveScrollPosition = () => {
    if (!scrollbarRef.value?.wrapRef) return { scrollTop: 0, shouldAutoScroll: true };

    return {
      scrollTop: scrollbarRef.value.wrapRef.scrollTop,
      shouldAutoScroll: shouldAutoScroll.value
    };
  };

  /**
   * 恢复滚动位置
   */
  const restoreScrollPosition = (position: { scrollTop: number; shouldAutoScroll: boolean }) => {
    if (scrollbarRef.value?.wrapRef) {
      scrollbarRef.value.wrapRef.scrollTop = position.scrollTop;
      shouldAutoScroll.value = position.shouldAutoScroll;
    }
  };

  /**
   * 滚动到指定消息
   */
  const scrollToMessage = (messageId: string) => {
    const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageEl && scrollbarRef.value?.wrapRef) {
      const wrapEl = scrollbarRef.value.wrapRef;
      const messageRect = messageEl.getBoundingClientRect();
      const wrapRect = wrapEl.getBoundingClientRect();
      const scrollTop = wrapEl.scrollTop + messageRect.top - wrapRect.top - 100;

      wrapEl.scrollTo({
        top: scrollTop,
        behavior: "smooth"
      });
    }
  };

  return {
    scrollbarRef,
    showScrollToBottom,
    newMessageCount,
    isScrolling,
    shouldAutoScroll,
    scrollToBottom,
    scrollToBottomForNewMessage,
    handleScroll,
    scrollToPosition,
    smoothScrollToBottom,
    isAtBottom,
    resetScrollState,
    saveScrollPosition,
    restoreScrollPosition,
    scrollToMessage
  };
}
