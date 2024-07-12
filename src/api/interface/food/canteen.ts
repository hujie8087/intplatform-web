import { ReqPage } from "..";

// * 楼栋管理模块
export namespace Canteen {
  export interface ReqCanteenParams extends ReqPage {
    name?: string;
    status?: string;
  }
  export interface ResCanteen {
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
    delFlag: string;
    deleteBy: string;
    deleteTime: string;
    deliveryFeeIds: number[];
    pickupTypeIds: number[];
    deliveryIds: number[];
    deliveryTimeIds: number[];
  }
}
