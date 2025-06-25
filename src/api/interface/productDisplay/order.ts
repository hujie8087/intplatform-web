import { ReqPage } from "..";

// * 订单管理模块
export namespace Order {
  export type ReqOrderParams = ReqPage;
  export interface ResOrder {
    id: number;
    no: string;
    nick: string;
    name: string;
    tel: string;
    canteenId: number;
    canteenName: string;
    createTime: string;
    expectedTime: string;
    endTime: string;
    totalPrice: number;
    pickupCode: string;
    postPrice: number;
    status: number;
    remark: string;
    print: number;
    refund: number;
    singlePlayer: string;
    singleTime: string;
    statusName: string;
    tableNumber: string;
    pickupType: number;
    deliveryArea: string;
    address: string;
    orderDetailsList: ResOrderDish[];
  }
  export interface ResOrderDish {
    code: string;
    commodityId: number;
    createBy: string | null;
    createTime: string;
    deal: string;
    delFlag: string | null;
    deleteBy: string | null;
    deleteTime: null;
    id: number;
    image: string;
    name: string;
    num: number;
    orderId: number;
    price: number;
    remark: string | null;
    taste: string;
    updateBy: string | null;
    updateTime: string | null;
  }
}
