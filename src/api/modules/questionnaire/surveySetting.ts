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
// 问卷题目手动保存
export const topicSaves = (params, projectKey) => {
  return http.post<SurveySetting.save>(PORT1 + `/survey/project/autoSave?projectKey=${projectKey}`, params);
};

// 问卷题目编辑
export const editSurverTopic = projectKey => {
  return http.get<SurveySetting.getInfo>(PORT1 + `/survey/project/item/list`, { projectKey });
};

// 问卷题目编辑
export const getSurverDetail = projectKey => {
  return http.get<SurveySetting.getInfo>(PORT1 + `/survey/project/detail/${projectKey}`);
};
