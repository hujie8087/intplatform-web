import { ReqPage } from "..";

// * 动物模块
export namespace Animals {
  export interface ReqAnimalsParams extends ReqPage {
    name?: string;
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
