import { ReqPage } from "..";

// * 订桌/货架管理模块
export namespace OrderPickup {
  export interface ReqOrderPickupParams extends ReqPage {
    name?: string;
    status?: string;
  }
  export interface ResOrderPickup {
    canteenId: number;
    createTime: string;
    fullStatus: number;
    id: number;
    name: string;
    sort: number;
    status: number;
    updateTime: string;
  }
  export type CreateOrderPickup = Optional<ResOrderPickup, "id" | "createTime" | "updateTime">;
}
