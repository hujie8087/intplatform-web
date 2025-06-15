import { ReqPage } from "./index";

export namespace BusStation {
  export interface ReqBusStation extends ReqPage {
    name?: string;
  }
  export interface ResBusStation {
    id: number;
    name?: string;
    indonesianName?: string;
    status?: number;
    longitude?: number;
    latitude?: number;
    sort?: number;
    remark?: string;
    createBy?: string;
    createTime?: Date;
    updateBy?: string;
    updateTime?: Date;
  }
}

export namespace BusLine {
  export interface ReqBusLine extends ReqPage {
    lineName?: string;
    lineType?: number;
    status?: number;
  }
  export interface ResBusLine {
    clId: number;
    lineName: string;
    status?: number;
    sort?: number;
    remark?: string;
    lineTime?: string;
    sId?: number[];
    lineType?: number;
    linePath?: string;
    lineDetails?: string;
    allPath?: string;
    cdtId?: number[];
    carDepartureTimeList?: BusDeparture.ResBusDeparture[];
    carSiteList?: BusStation.ResBusStation[];
  }
}

export namespace BusCar {
  export interface ReqBusCar extends ReqPage {
    name?: string;
  }
  export interface ResBusCar {
    cmId: number;
    parkNo?: string;
    carState?: string;
    lineId?: number;
    carNo?: string;
    carType?: number;
    loadNumber?: number;
    remark?: string;
    createBy?: string;
    createTime?: Date;
    updateBy?: string;
    updateTime?: Date;
    path?: string;
    def1?: string;
    def2?: string;
    def3?: string;
    def4?: string;
    def5?: string;
  }
}

export namespace BusDeparture {
  export interface ReqBusDeparture extends ReqPage {
    name?: string;
  }
  export interface ResBusDeparture {
    id: number;
    departureTime?: string;
    arrivalTime?: number;
    remark?: string;
    createBy?: string;
    createTime?: Date;
    updateBy?: string;
    updateTime?: Date;
  }
}
