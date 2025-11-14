import { ref } from "vue";
import { ElMessage } from "element-plus";
import { SosChart } from "@/api/interface/sosAlart";
import { getChatHistory } from "@/api/modules/sosAlart/chat";

/**
 * 加载更多消息 Composable
 * 统一处理消息分页加载逻辑
 */
export function useLoadMore() {
  const loadingMore = ref(false);
  const hasMoreMessages = ref(true);
  const pageSize = ref(100);
  const currentPage = ref(1);

  /**
   * 加载更多消息
   */
  const loadMoreMessages = async (
    sessionId: string,
    existingMessages: SosChart.ResChatMessageList[]
  ): Promise<SosChart.ResChatMessageList[]> => {
    if (loadingMore.value || !hasMoreMessages.value) {
      return [];
    }

    loadingMore.value = true;

    try {
      // 计算当前页码（基于已有消息数量）
      const page = Math.floor(existingMessages.length / pageSize.value) + 1;

      const response: any = await getChatHistory(sessionId, {
        page: page,
        size: pageSize.value
      });
      console.log(response);

      const newMessages = response.data?.records || response.data || [];
      const total = response.data?.total || response.total || 0;

      // 优化：检查是否还有更多消息
      // 1. 如果返回的消息数量小于页面大小，说明没有更多了
      // 2. 如果当前已加载的消息总数（包括新加载的）已经达到或超过总数，说明没有更多了
      const currentTotalMessages = existingMessages.length + newMessages.length;

      if (newMessages.length < pageSize.value || (total > 0 && currentTotalMessages >= total)) {
        hasMoreMessages.value = false;
        console.log(
          `没有更多消息了: 返回消息数=${newMessages.length}, 页面大小=${pageSize.value}, 当前总数=${currentTotalMessages}, 服务器总数=${total}`
        );
      }

      // 更新当前页码
      currentPage.value = page;

      console.log(
        `加载第${page}页消息: 新消息数=${newMessages.length}, 当前总数=${currentTotalMessages}, 服务器总数=${total}, 还有更多=${hasMoreMessages.value}`
      );

      return newMessages;
    } catch (error) {
      console.error("加载更多消息失败:", error);
      ElMessage.error("加载更多消息失败");
      throw error;
    } finally {
      loadingMore.value = false;
    }
  };

  /**
   * 重置加载状态
   */
  const resetLoadState = () => {
    loadingMore.value = false;
    hasMoreMessages.value = true;
    currentPage.value = 1;
  };

  /**
   * 设置页面大小
   */
  const setPageSize = (size: number) => {
    pageSize.value = size;
  };

  /**
   * 检查是否可以加载更多
   */
  const canLoadMore = (): boolean => {
    return hasMoreMessages.value && !loadingMore.value;
  };

  /**
   * 预加载下一页消息
   */
  const preloadNextPage = async (sessionId: string, existingMessages: SosChart.ResChatMessageList[]): Promise<void> => {
    if (!canLoadMore()) {
      return;
    }

    try {
      await loadMoreMessages(sessionId, existingMessages);
    } catch (error) {
      console.error("预加载消息失败:", error);
    }
  };

  /**
   * 获取加载状态信息
   */
  const getLoadStatus = () => {
    return {
      loading: loadingMore.value,
      hasMore: hasMoreMessages.value,
      currentPage: currentPage.value,
      pageSize: pageSize.value
    };
  };

  return {
    loadingMore,
    hasMoreMessages,
    pageSize,
    currentPage,
    loadMoreMessages,
    resetLoadState,
    setPageSize,
    canLoadMore,
    preloadNextPage,
    getLoadStatus
  };
}
