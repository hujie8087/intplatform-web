import { defineStore } from "pinia";
import { MessageState } from "@/stores/interface";

export const useMessageStore = defineStore({
  id: "logistics-message",
  state: (): MessageState => ({
    // 待办数量
    todoCount: 1,
    messageCount: 1,
    notificationCount: 1
  }),
  getters: {
    todoCountGet: state => state.todoCount,
    messageCountGet: state => state.messageCount,
    notificationCountGet: state => state.notificationCount
  },
  actions: {
    async setMessage(data: MessageState) {
      this.todoCount = data.todoCount;
      this.notificationCount = data.notificationCount;
      this.messageCount = data.messageCount;
    }
  }
});
