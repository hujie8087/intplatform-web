import { Login } from "@/api/interface/index";
import { defineStore } from "pinia";
import { UserState } from "@/stores/interface";
import piniaPersistConfig from "@/stores/helper/persist";
import { getUserInfoApi, getUserPermissionInfoApi } from "@/api/modules/login";
import { useAuthStore } from "./auth";
export const useUserStore = defineStore({
  id: "logistics-user",
  state: (): UserState => ({
    token: "",
    refreshToken: "",
    thirdUserInfo: {
      account: "",
      avatar: "",
      card: "",
      formatOrganizeName: "",
      id: 0,
      name: "",
      postName: "",
      sex: 0,
      tel: ""
    },
    userInfo: {
      permissions: [],
      roles: [],
      user: {},
      mealUser: {} as Login.ResUserInfo["mealUser"]
    }
  }),
  getters: {
    // Get userInfo
    userInfoGet: state => state.userInfo,
    accessTokenGet: () => localStorage.getItem("access_token") || "",
    refreshTokenGet: () => localStorage.getItem("refresh_token") || ""
  },
  actions: {
    // Set Token
    setToken(token: string) {
      this.token = token;
      // 同时存储到 localStorage 中
      if (token) {
        localStorage.setItem("access_token", token);
      } else {
        localStorage.removeItem("access_token");
      }
    },
    setRefreshToken(refreshToken: string) {
      this.refreshToken = refreshToken;
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      } else {
        localStorage.removeItem("refresh_token");
      }
    },
    // Set setUserInfo
    setUserInfo(userInfo: UserState["userInfo"]) {
      this.userInfo = userInfo;
    },
    setThirdUserInfo(userInfo: Login.ResThirdUserInfo) {
      this.thirdUserInfo = userInfo;
    },
    async getUserInfo() {
      const res = await getUserInfoApi();
      const permissionRes = await getUserPermissionInfoApi();
      const authStore = useAuthStore();
      authStore.getAuthButtonList(permissionRes.data?.permissions || []);
      this.setUserInfo(permissionRes.data);
      this.setThirdUserInfo(res.data);
      if (permissionRes.data?.mealUser) {
        authStore.getMealDeliveryAuthButtonList(permissionRes.data.mealUser.permissions);
      }
    }
  },
  persist: piniaPersistConfig("logistics-user")
});
