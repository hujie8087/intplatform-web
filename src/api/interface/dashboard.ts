// * 数据可视化模块
export namespace DataVisualize {
  export interface ResDeliveryCompletionRate {
    deliveryStaff: DeliveryStaff[];
    sourceMsg: DeliveryStaff[];
  }
  export interface DeliveryStaff {
    deliveryName: string;
    orderCount: number;
    siteName: string;
  }
  export interface ResCateringScreenData {
    forStore: Store[];
    forType: Store[];
  }
  export interface Store {
    store: string;
    num: number;
    type: string;
  }
}
