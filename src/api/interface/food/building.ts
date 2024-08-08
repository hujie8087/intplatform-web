import { ReqPage } from "..";

// * 楼栋管理模块
export namespace Building {
  export type ReqBuildingParams = ReqPage;
  export interface ResBuilding {
    id: number;
    code?: number;
    pid: number;
    sort: number;
    title?: string;
    status?: number;
    hasChildren?: boolean;
    ancestors: string;
    expected: number;
    actual: number;
    children?: ResBuilding[];
  }
  export interface Statistics {
    actual: number;
    expected: number;
    remaining: number;
    id?: number;
  }
  export interface ResStatistics {
    actualList: number;
    expectedList: number;
    remainingList: number;
    checkVO: Statistics[];
  }
}
