import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

// 查询餐饮设置
export function getFoodSetting() {
  return http.get<{ ramadan: boolean }>(PORT1 + "/system/mdc/setting");
}

// 修改餐饮设置
export function updateFoodSetting(data: { ramadan: boolean }) {
  return http.put<any>(PORT1 + "/system/mdc/setting", data);
}
