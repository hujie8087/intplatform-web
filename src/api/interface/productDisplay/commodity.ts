import { ReqPage } from "..";

// 商品管理模块
export namespace Commodity {
  export interface ReqCommodityParams extends ReqPage {
    canteenId: number;
    categoryId: number;
    name?: string;
    status?: number;
  }
  export interface ResCommodity {
    id: number;
    name: string;
    price: number;
    stock: number;
    categoryId: number;
    code: string;
    image: string;
    sort: number;
    canteenId: number;
    createTime: string;
    updateTime: string;
    status: number;
    canteenName: string;
    categoryName: string;
    commodityParameterList: CommodityParameter[];
    remark: string;
  }
  export interface CommodityParameter {
    id: number;
    name: string;
    price: number;
    type: number;
  }
  export type CreateCommodity = Optional<ResCommodity, "id" | "createTime" | "updateTime">;
}
