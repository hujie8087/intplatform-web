/**
 * v-auth
 * 按钮权限指令
 */
import { useAuthStore } from "@/stores/modules/auth";
import type { Directive, DirectiveBinding } from "vue";

const mealAuth: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding;
    const all_permission = "*:*:*";
    const authStore = useAuthStore();
    const currentPageRoles = authStore.mealDeliveryAuthButtonListGet ?? [];
    if (value instanceof Array && value.length) {
      const hasPermission = currentPageRoles.includes(all_permission) || value.every(item => currentPageRoles.includes(item));
      if (!hasPermission) el.remove();
    } else {
      if (!currentPageRoles.includes(value)) el.remove();
    }
  }
};
export default mealAuth;
