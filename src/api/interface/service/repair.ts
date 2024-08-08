import { ReqPage } from "..";

// * 保修管理模块
export namespace Repair {
  export interface ReqRepairParams extends ReqPage {
    repairArea?: string;
    roomNo?: string;
    repairPerson?: string;
    repairMan?: string;
    repairState?: string;
  }
  export interface ResRepair {
    id: number;
    repairArea: string;
    repairAreaId: number;
    repairMessage: string;
    roomNo: string;
    repairRoomId: number;
    repairPerson: string | null;
    tel: string;
    repairNo: string;
    repairPhoto: string;
    repairMan: string;
    repairManId: number;
    repairState: number;
    repairTime: string;
    repairImag: string;
    repairNote: string;
    repairType: number;
    rating: string;
    ratingMessage: string;
    delFlag?: string;
    remark?: string;
    def1?: string;
    def2?: string;
    def3?: string;
    def4?: string;
    def5?: string;
    createBy?: string;
    createTime?: Date;
    updateBy?: string;
    updateTime?: Date;
    deleteBy?: string;
    deleteTime?: Date;
    sourceNo?: string;
    souceType?: string;
    ancestors?: string;
    appDelFlag?: string;
    readStatus?: string;
  }

  export interface ReqRepairTypeParams extends ReqPage {
    name?: string;
    status?: string;
  }

  export interface ResRepairType {
    id: number;
    name: string;
    delFlag?: string;
    status?: string;
    remark?: string;
    def1?: string;
    def2?: string;
    def3?: string;
    def4?: string;
    def5?: string;
    createBy?: string;
    createTime?: Date;
    updateBy?: string;
    updateTime?: Date;
    deleteBy?: string;
    deleteTime?: Date;
  }
  export interface RepairRegion {
    name: string;
    repairArea: string;
    num: number;
  }

  export interface RepairData {
    region: RepairRegion[];
    type: RepairRegion[];
  }
}
