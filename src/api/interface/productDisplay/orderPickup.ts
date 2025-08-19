import { ReqPage } from "..";

// * 订桌/货架管理模块
export namespace PickupCode {
  export interface ReqPickupCodeParams extends ReqPage {
    name?: string;
    status?: string;
  }
  export interface ResPickupCode {
    canteenId: number;
    id: number;
    code: string;
    enabled: string;
  }
  export interface CreatePickupCode {
    num: number;
    canteenId: number | undefined;
    pick: string;
    layers: number;
  }
  export interface BatchUpdatePickupCodeStatus {
    code: string;
    enabled: number;
  }
}
