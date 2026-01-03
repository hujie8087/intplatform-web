import { ReqPage } from "..";

// 每日菜谱模块
export namespace Dish {
  export interface ReqDishParams extends ReqPage {
    name?: string;
    status?: number;
  }
  export interface ResDish {
    id: number;
    name: string;
    status: number;
    dishType: number;
    description: string;
    imageUrl: string;
    createTime: string;
    createBy: string;
    updateTime: string;
    updateBy: string;
    mealType: number;
  }
  export type CreateDish = Optional<ResDish, "id" | "createTime" | "updateTime" | "mealType" | "createBy" | "updateBy">;
}

// 每日菜谱模块
export namespace DailyRecipe {
  export interface ReqDailyRecipeParams extends ReqPage {
    beginDate?: string;
    endDate?: string;
  }
  export interface CreateDailyRecipe {
    id?: number;
    menuDate?: string;
    dids: {
      0: string;
      1: string;
      2: string;
    };
  }
  export interface ResDailyRecipe {
    createBy: string;
    createTime: string;
    updateBy: string;
    updateTime: string;
    remark: string;
    startQueryTime: string;
    endQueryTime: string;
    id: number;
    menuDate: string;
    dishs: Dish.ResDish[];
  }
}
