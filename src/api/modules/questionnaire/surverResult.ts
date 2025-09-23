// 问卷查看答题信息api接口
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { SurveySetting } from "@/api/interface/questionnaire/surveySetting";
export const getSurveyResult = (params: { id: string; projectKey: string }) => {
  return http.get<SurveySetting.getInfo>(PORT1 + `/survey/answer/result/dtl`, params);
};
