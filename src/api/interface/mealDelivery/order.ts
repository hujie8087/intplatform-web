// 水单结算模块
import { ReqPage } from "..";

export namespace MdcOrder {
  export interface ReqMdcOrderParams extends ReqPage {
    orderNo?: string;
    orderStatus?: string;
  }
  export interface ResMdcOrder {
    keyword: string;
    createBy: string;
    createTime: string;
    updateBy: string;
    updateTime: string;
    remark: string;
    deleteTime: string;
    deleteBy: string;
    userIdList: string;
    strArrays: string;
    statusArrays: string;
    foodArrays: string;
    orderArrays: string;
    oId: number;
    orderStatus: string;
    deliveryId: number;
    deliverySite: string;
    remarks: string;
    orderNo: string;
    foodName: string;
    foodType: string;
    fdId: number;
    canteen: string;
    fcId: number;
    fcName: string;
    imageUrl: string;
    leaderStatus: string;
    delFlag: string;
    centerStatus: string;
    deliveryType: string;
    packageType: string;
    pNum: number;
    userId: number;
    deptId: number;
    reason: string;
    centerBy: string;
    sourceId: string;
    sourceType: string;
    userUame: string;
    phone: string;
    sourceNo: string;
    deptName: string;
    auditTime: string;
    rejectTime: string;
    printed: string;
    canteenPrinted: string;
    orderTime: string;
    leadTime: string;
    packTime: string;
    mealTime: string;
    completeTime: string;
    teamSubmitTime: string;
    deptSubmitTime: string;
    children: MdcOrderStaff[];
  }

  export interface MdcOrderStaff {
    keyword: string;
    createBy: string;
    createTime: string;
    updateBy: string;
    updateTime: string;
    remark: string;
    deleteTime: string;
    deleteBy: string;
    userIdList: string;
    strArrays: string;
    statusArrays: string;
    foodArrays: string;
    orderArrays: string;
    odId: number;
    oId: number;
    userName: string;
    userNo: string;
    remarks: string;
    userId: string;
    deptId: string;
    def3: string;
    def4: string;
    def5: string;
    postId: string;
    companyId: string;
    postName: string;
    nationType: string;
    companyName: string;
    deptName: string;
    delFlag: string;
    firstLevelDeptName: string;
  }
}
