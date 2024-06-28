import { ReqPage } from "./index";

export namespace VideoType {
  export interface ReqVideoType extends ReqPage {
    typeName?: string;
  }
  export interface ResVideoType {
    id: number;
    typeName?: string;
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
  }
}

export namespace Gather {
  export interface ReqGather extends ReqPage {
    videoName?: string;
  }
  export interface CreateGather {
    videoName?: string;
    coverPath: string;
    description: string;
    playVolume: number;
    score: number;
    scoreNum: number;
    releaseYear: string;
    type?: number;
    labelIds: string;
    ranscode: number;
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
    videoGatherDetails: GatherDetail[];
  }
  export interface ResGather {
    id?: number;
    videoName?: string;
    coverPath: string;
    description: string;
    playVolume: number;
    score: number;
    scoreNum: number;
    releaseYear: string;
    type: number;
    labelIds: string;
    ranscode: number;
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
    videoGatherDetails?: GatherDetail[];
  }
  export interface GatherDetailCreate {
    gId?: string;
    dTitle: string;
    sourcePath: string;
    h264: string;
    m3u8: string;
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
  }
  export interface GatherDetail extends GatherDetailCreate {
    id?: number;
  }
}
export namespace VideoLabel {
  export interface ReqVideoLabel extends ReqPage {
    labelName?: string;
    labelType?: number;
  }
  export interface ResVideoLabel {
    id: number;
    labelType?: number;
    labelName: string;
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
  }
}
