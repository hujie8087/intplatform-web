// 水单结算模块
import { ReqPage } from "..";

export namespace Settlement {
  export interface ReqSettlementParams extends ReqPage {
    orderNo?: string;
    orderStatus?: string;
  }
  export interface ResSettlement {
    oId: number;
    orderNo: string;
    orderDate: string;
    companyName: string;
    deptPath: string;
    num: number;
    createBy: string;
    jobNumber: string;
    deliverySite: string;
    phoneNumber: string;
    foodType: string;
    foodName: string;
    canteen: string;
    packageType: string;
    deliveryType: string;
    fcName: string;
    orderStatus: string;
    centerStatus: string;
    printed: string;
    canteenPrinted: string;
    orderTime: string;
    leadTime: string;
    mealTime: string;
    completeTime: string;
    teamSubmitTime: string;
    deptSubmitTime: string;
    children: Staff[];
  }

  export interface Staff {
    orderNo: string;
    orderTime: string;
    companyName: string;
    deptPath: string;
    userName: string;
    userNo: string;
    postName: string;
  }
}
