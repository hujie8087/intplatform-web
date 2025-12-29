import { ReqPage } from "..";

// * 动物模块
export namespace Animals {
  export interface ReqAnimalsParams extends ReqPage {
    name?: string;
    oId?: number;
  }
  export interface ResAnimals {
    fId: number;
    name: string;
    introduce: string;
    peacockType: string;
    origin: string;
    food: string;
    habit: string;
    reproduce: string;
    location: string;
    picture: string;
    language: string;
    type: string;
    oId: number;
    del_flag: string;
    create_by: string;
    create_time: string;
    update_by: string;
    update_time: string;
    delete_by: string;
    delete_time: string;
    remark: string;
    sort: number;
    status: string;
    otherName: string;
    feature: string;
    code: string;
  }
}

// * 生物类型模块
export namespace OrganismType {
  export interface ReqOrganismTypeParams extends ReqPage {
    name?: string;
    type?: number;
  }
  export interface ResOrganismType {
    id: number;
    name: string;
    code: string;
    type: number;
    status: string;
    sort: number;
    del_flag: string;
    create_by: string;
    create_time: string;
    update_by: string;
    update_time: string;
    delete_by: string;
    delete_time: string;
  }
}
