import { ReqPage } from "..";

// * 商店管理模块
export namespace MarketCanteen {
  export interface ReqMarketCanteenParams extends ReqPage {
    name?: string;
    status?: string;
  }
  export interface ResMarketCanteen {
    createBy: string;
    createTime: string;
    updateBy: string;
    updateTime: string;
    remark: string;
    id: number;
    name: string;
    image: string;
    status: number;
    startTime: string;
    endTime: string;
    bookTable: number;
    pickup: number;
    code: string;
    pickTypes: number[];
    delFlag: string;
    deleteBy: string;
    deleteTime: string;
    deliveryFeeIds: number[];
    pickupTypeIds: number[];
    deliveryIds: number[];
    deliveryTimeIds: number[];
    newDeliveryIds: number[];
  }
  export type CreateMarketCanteen = Optional<ResMarketCanteen, "id" | "createTime" | "updateTime">;
}
