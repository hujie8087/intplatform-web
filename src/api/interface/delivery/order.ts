// 物资订单模块
import { ReqPage } from "..";

export namespace OrderDelivery {
  export interface ReqOrderDeliveryParams extends ReqPage {
    orderNo?: string;
    orderStatus?: string;
  }
  export interface ResOrderDelivery {
    id: number; // 唯一标识符
    orderNo: string; // 订单号
    orderType: number; // 订单类型
    nick: string; // 用户昵称或标识
    deliveryName: string; // 收货人姓名
    deliveryTel: string; // 收货人电话
    deliveryAddress: string; // 收货地址
    deliveryTime: string; // 送货时间
    orderTime: string; // 下单时间
    deliveryFee: number; // 配送费用
    actualPayment: number; // 实际支付金额
    delFlag: string; // 删除标志
    deleteBy: string; // 删除人
    deleteTime: string; // 删除时间（可能为空）
    createBy: string; // 创建人
    createTime: string; // 创建时间
    updateBy: string; // 更新人
    updateTime: string; // 更新时间
    remark: string; // 备注
    startQueryTime: string | null; // 查询起始时间（可能为空）
    endQueryTime: string | null; // 查询结束时间（可能为空）
    sourceNo: string; // 订单来源编号
    deliveryStatus: number; // 配送状态
    sourceStation: string; // 来源站点
    sourceType: string; // 来源类型
    deliveryStaffId: string; // 配送员ID
    deliveryNo: string; // 配送编号
    arrivalTime: string | null; // 到达时间（可能为空）
    code: string; // 配送站点
    errorMsg: string | null; // 异常信息
  }
  export interface ResOrderDeliveryItemDetail {
    id: number;
    sourceNo: string;
    itemName: string;
    itemQuantity: number;
    itemPrice: number;
    remarks: string | null;
    delFlag: string;
    createBy: string;
    createTime: string;
    updateBy: string;
    updateTime: string;
    deleteBy: string;
    deleteTime: string;
    def1: string;
    def2: string;
    def3: string;
    def4: string;
    status: string;
  }
  export interface ResOrderDeliveryLocation {
    id: number;
    sourceNo: string;
    locationName: string;
    locationType: string;
    locationAddress: string;
  }
  export interface ResOrderDeliveryStatusNode {
    status: number;
    time: string;
    deliveryStaffMsg: string | null;
  }
  export interface ResOrderDeliveryDetail {
    orderDelivery?: OrderDelivery.ResOrderDelivery;
    orderDeliveryItemDetailsList?: ResOrderDeliveryItemDetail[];
    orderDeliveryLocations?: ResOrderDeliveryLocation[];
    statusNodes?: ResOrderDeliveryStatusNode[];
  }
}
