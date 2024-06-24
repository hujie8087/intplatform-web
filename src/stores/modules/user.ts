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
    userInfo: {
      permissions: [],
      roles: [],
      user: {} as Login.ResUserInfo["user"]
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
    // Set setUserInfo
    setUserInfo(userInfo: UserState["userInfo"]) {
      this.userInfo = userInfo;
    },
    async getUserInfo() {
      const res = await getUserInfoApi();
      this.setUserInfo(res.data);
      const authStore = useAuthStore();
      authStore.getAuthButtonList(res.data.permissions);
    }
  },
  persist: piniaPersistConfig("logistics-user")
});
