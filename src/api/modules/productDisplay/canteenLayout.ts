import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { CanteenLayout } from "@/api/interface/productDisplay/canteenLayout";

export const getCanteenLayoutList = () => {
  return http.getRow<CanteenLayout.ResCanteenLayout>(PORT1 + "/productdisplay/canteenLayout/list");
};

export const createCanteenLayout = (data: CanteenLayout.CreateCanteenLayout) => {
  return http.post(PORT1 + "/productdisplay/canteenLayout", data);
};

export const updateCanteenLayout = (data: CanteenLayout.ResCanteenLayout) => {
  return http.put(PORT1 + "/productdisplay/canteenLayout", data);
};

export const deleteCanteenLayout = (id: string) => {
  return http.delete(PORT1 + "/productdisplay/canteenLayout/" + id);
};
// 获取布局详情
export const getCanteenLayoutDetail = (id: string) => {
  return http.get<CanteenLayout.ResCanteenLayout>(PORT1 + "/productdisplay/canteenLayout/" + id);
};

// 一键翻台
export const resetTableStatusById = (id: string) => {
  return http.get(PORT1 + "/productdisplay/canteenLayoutDesk/turnover", { id: id });
};
