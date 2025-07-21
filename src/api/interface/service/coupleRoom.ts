import { ReqPage } from "..";

// * 宿舍服务模块
export namespace CoupleRoom {
  // 房间管理
  export interface ReqRoomParams extends ReqPage {
    title?: string;
    isLogin?: number;
    status?: string;
    start?: string;
    end?: string;
  }
  export interface ResRoom {
    createTime: string;
    updateTime: string;
    createById: number;
    status: number;
    remark: string;
    areaType: number;
    id: number;
    name: string;
    lastTime: string;
    rollTime: string;
    isSubmit: string | null;
    startTime: string | null;
    endTime: string | null;
    order: ResRoomOrder[];
  }
  // 订单管理
  export interface ReqOrderParams extends ReqPage {
    title?: string;
    isLogin?: number;
    status?: string;
    start?: string;
    end?: string;
    startTime?: string;
    endTime?: string;
    chamberName?: string;
    nick?: string;
    orderStatus?: string;
  }
  export interface ResRoomOrder {
    createTime: string;
    updateTime: string;
    createById: number;
    status: number;
    remark: string;
    id: number;
    no: string;
    startTime: string;
    chamberName: string;
    name: string;
    nick: string;
    day: number;
    endTime: string;
    price: number;
    freeze: boolean;
    staffList: ResStaff[] | null;
    auditList: ResAudit[] | null;
    keychain: number;
    deleted: number;
    confirmTime: string;
  }

  //   人员管理
  export interface ReqStaffParams extends ReqPage {
    areaType?: string;
    username?: string;
    name?: string;
    status?: string;
  }
  export interface ResStaff {
    areaType: string;
    bind: string;
    createById: number;
    createTime: string;
    deleted: number;
    dept: string;
    entrtyTime: string;
    id: number;
    job: string;
    name: string;
    num: number;
    orderId: string | null;
    password: string;
    remark: string;
    sex: string;
    status: number;
    tel: string;
    updateTime: string;
    username: string;
  }
  export interface ResAudit {
    content: string;
    createTime: string;
    id: number;
    name: string;
    orderId: number;
    status: string;
    title: string;
  }

  //   留言反馈
  export interface ReqFeedbackParams extends ReqPage {
    type?: string;
  }
  export interface ResFeedback {
    content: string;
    createById: number;
    createTime: string;
    id: number;
    remark: string;
    status: number;
    type: string;
  }
}
