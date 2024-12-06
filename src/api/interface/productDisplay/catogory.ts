// "id": 6,
// "name": "烧烤",
// "sort": 6,
// "canteenId": 2,
// "canteenName": "李白火锅城",
// "createTime": "2022-07-05T17:47:45",
// "updateTime": "2022-07-05T17:47:52",
// "status": 1

import { ReqPage } from "..";

// * 菜品分类模块
export namespace Category {
  export interface ReqCategoryParams extends ReqPage {
    canteenId: number;
    name?: string;
    status?: number;
  }
  export interface ResCategory {
    id: number;
    name: string;
    sort: number;
    canteenId: number;
    canteenName: string;
    createTime: string;
    updateTime: string;
    status: number;
    remark?: string;
  }
  export type CreateCategory = Optional<ResCategory, "id" | "createTime" | "updateTime">;
}
