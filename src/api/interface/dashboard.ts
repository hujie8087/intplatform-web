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
  export interface Personnel {}
  export interface RepairStatistics {
    totalCount: number;
    waitReWorkCount: number;
    waitingCount: number;
    finishCount: number;
    reWorkCount: number;
    endCount: number;
    finishCountIn24H: number;
    finishRateIn24H: number;
  }
  export interface CheckHiddenDanger {
    totalCount: number;
    waitCount: number;
    processingCount: number;
    processedCount: number;
  }
  export interface MealService {
    orderCount: number;
    foodCount: number;
    deliveryCount: number;
    deliveredCount: number;
  }
}

interface ChartSeries {
  name: string;
  type: string;
  data: any[];
  symbol: string;
  areaStyle: any;
  smooth: boolean;
  symbolSize: number;
  showSymbol: boolean;
  itemStyle: any;
}
export interface chartOptionType {
  xData: (number | string)[];
  seriesDat: ChartSeries[];
}

interface YearDataItem {
  month: number; // 月份 (1-12)
  totalCount: number; // 总用户数
  loginCount: number; // 登录数
  registerCount: number; // 注册数
}

export interface ResponseType {
  msg: string;
  code: number | string;
  data: {
    allCount: number | string;
    onlineCount: number | string;
    todayLoginCount: number | string;
    todayRegisterCount: number | string;
    yearData: YearDataItem[];
  };
}
