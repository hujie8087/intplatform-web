import { ReqPage } from ".";

// * 隐患管理模块
export namespace HiddenDanger {
  export interface ReqHiddenDangerParams extends ReqPage {
    name?: string;
    findTime?: string;
    reportPerson?: number;
  }
  export interface ResHiddenDanger {
    id: number;
    name: string;
    location: number;
    userName: string;
    findTime: string;
    reportPerson: number;
    tel: string;
    describes: string;
    progress: string;
    url: string;
    delFlag?: string;
    remark?: string;
    handleBy?: string;
    handleTime?: string;
    handleResult?: string;
    handlePhoto?: string;
    def1?: string;
    def2?: string;
    def3?: string;
    def4?: string;
    def5?: string;
    createBy?: string;
    createTime?: Date;
    updateBy?: string;
    updateTime?: Date;
    isRead?: number;
  }
}
