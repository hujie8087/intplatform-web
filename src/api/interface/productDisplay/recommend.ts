// 菜品推荐

import { ReqPage } from "..";

export namespace Recommend {
  export interface ReqRecommendParams extends ReqPage {
    name?: string;
    status?: string;
  }
  export interface ResRecommend {
    rdId: number;
    rdReason: string;
    rdDate: string;
    remark: string;
    delFlag: string;
    rdTime: string;
    photoUrl: string;
    foodName: string;
    createBy: string;
    deleteTime: string;
    createTime: string;
    updateBy: string;
    deleteBy: string;
    rdLocation: string;
    updateTime: string;
    status: string;
    recommendedBy: string;
  }
  export type CreateRecommend = Optional<ResRecommend, "rdId" | "createTime" | "updateTime">;
}
