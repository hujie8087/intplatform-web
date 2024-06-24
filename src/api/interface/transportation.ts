import { ReqPage } from ".";

// 车辆模块
export namespace Buses {
  export interface ReqBusesParams extends ReqPage {
    parkNo?: string;
    carType?: string;
    lineNo?: string;
    carState?: string;
  }
  export interface ResBuses {
    cmId: number;
    parkNo: string;
    lineNo: number;
    carType: string;
    loadNumber: string;
    carState: string;
    remark: string;
    path: string;
    def1: string;
    def2: string;
    def3: string;
    def4: string;
    def5: string;
    createBy: string;
    createTime: string;
    updateBy: string | null;
    updateTime: string | null;
    souceType: string;
    sourceNo: string;
  }
}

// 公交线路模块
export namespace BusRoutes {
  export interface ReqBusRoutesParams extends ReqPage {
    lineName?: string;
    type?: string;
    status?: string;
  }
  export interface ResBusRoutes {
    clId: number;
    lineName: string;
    lineDetails: string;
    lineTime: string;
    linePath: string;
    remark: string;
    def1: string;
    def2: string;
    def3: string;
    def4: string;
    allPath: string;
    createBy: string;
    createTime: string;
    updateBy: string | null;
    updateTime: string | null;
    souceType: string;
    sourceNo: string;
  }
}
