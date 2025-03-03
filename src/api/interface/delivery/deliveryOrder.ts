// 配送订单模块
import { ReqPage } from "..";
import { OrderDelivery } from "./order";

export namespace DeliveryOrder {
  export interface ReqDeliveryOrderParams extends ReqPage {
    orderNo?: string;
    orderStatus?: string;
  }
  export interface ResDeliveryOrder {
    id: number; // 唯一标识符
    deliveryNo: string; // 交付单号
    name: string; // 名称
    tel: string; // 电话号码
    status: string; // 状态
    delFlag: string; // 删除标志，"0"表示未删除
    createBy: string; // 创建人
    createTime: string; // 创建时间
    updateBy: string; // 更新人
    updateTime: string; // 更新时间
    deleteBy: string | null; // 删除人（可能为空）
    deleteTime: string | null; // 删除时间（可能为空）
    userId: number; // 用户ID（可能为空）
  }
  export interface ReqAddDeliveryOrder {
    orderId: number[];
    staffId: number;
  }
  export interface ResDeliveryOrderById {
    orderDeliveryList: OrderDelivery.ResOrderDelivery[];
    orderDeliveryTrip: ResDeliveryOrder;
  }
}
