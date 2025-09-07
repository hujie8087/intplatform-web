// 问卷设置api接口
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { SurveySetting } from "@/api/interface/questionnaire/surveySetting";
export const getSurveySetting = (projectKey?: string) => {
  return http.get<SurveySetting.getInfo>(PORT1 + `/survey/project/setting/${projectKey}`);
};

export const save = params => {
  return http.post<SurveySetting.save>(PORT1 + `/survey/project/setting`, params);
};
