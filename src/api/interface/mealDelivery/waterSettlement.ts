// 水单结算模块
import { ReqPage } from "..";

export namespace WaterSettlement {
  export interface ReqWaterSettlementParams extends ReqPage {
    orderNo?: string;
    orderStatus?: string;
  }
  export interface ResWaterSettlement {
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
    leadTime: any;
    mealTime: any;
    completeTime: any;
    teamSubmitTime: any;
    deptSubmitTime: string;
    children: any;
    showTimeline: boolean;
  }
}
