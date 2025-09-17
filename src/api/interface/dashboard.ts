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
  export interface SiteInformation {
    msg: string;
    code: number;
    data: SiteInformationList[];
  }
  export interface CarLine {
    msg: string;
    code: number;
    data: CarListItem[];
  }
  export interface CarMessge {
    msg: string;
    code: number;
    data: {
      deliveredCount: number;
      deliveryCount: number;
      foodCount: number;
      orderCount: number;
    };
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
interface SiteInformationList {
  fsId: number;
  fsAddressId: string;
  latitude: number | null;
  longitude: number | null;
  nationType: string | null;
  orderCount: number;
  goodsCount: number;
  remainingGoodsCount: number;
  receivedGoodsCount: number;
}
type Coordinate = [number, number];
interface CarListItem {
  coordinatesList: string | null;
  fcId: number;
  fcName: string;
  line: Coordinate[]; // 坐标数组（包含多个 [number, number]）
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
