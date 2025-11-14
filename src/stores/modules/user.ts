import { Login } from "@/api/interface/index";
import { defineStore } from "pinia";
import { UserState } from "@/stores/interface";
import piniaPersistConfig from "@/stores/helper/persist";
import { getUserInfoApi } from "@/api/modules/login";
import { useAuthStore } from "./auth";
export const useUserStore = defineStore({
  id: "logistics-user",
  state: (): UserState => ({
    token: "",
    refreshToken: "",
    userInfo: {
      permissions: [],
      roles: [],
      user: {} as Login.ResUserInfo["user"],
      mealUser: {} as Login.ResUserInfo["mealUser"]
    }
  }),
  getters: {
    // Get userInfo
    userInfoGet: state => state.userInfo
  },
  actions: {
    // Set Token
    setToken(token: string) {
      this.token = token;
    },
    setRefreshToken(refreshToken: string) {
      this.refreshToken = refreshToken;
    },
    // Set setUserInfo
    setUserInfo(userInfo: UserState["userInfo"]) {
      this.userInfo = userInfo;
    },
    async getUserInfo() {
      const res = await getUserInfoApi();
      this.setUserInfo(res.data);
      const authStore = useAuthStore();
      authStore.getAuthButtonList(res.data.permissions);
      if (res.data.mealUser) {
        authStore.getMealDeliveryAuthButtonList(res.data.mealUser.permissions);
      }
    }
  },
  persist: piniaPersistConfig("logistics-user")
});
