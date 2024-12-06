import { ReqPage } from "..";

// * 配送费管理模块
export namespace DeliveryFee {
  export interface ReqDeliveryFeeParams extends ReqPage {
    name?: string;
  }
  export interface ResDeliveryFee {
    id: number;
    billingConditions?: string;
    name: string;
    price: number;
    remark?: string;
  }
  export type CreateDeliveryFee = Optional<ResDeliveryFee, "id">;
}
