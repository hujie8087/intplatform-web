// * 组织管理模块
export namespace Organize {
  export type ReqOrganizeParams = {
    code?: string;
    dimensionCode: string;
    name?: string;
    status?: number;
  };
  export interface ResOrganize {
    id: number;
    pid: number;
    code: string;
    dimensionCode: string;
    name: string;
    formatName: string;
    sort: number;
    status: number;
  }
}
