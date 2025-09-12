// 问卷设置api接口
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
// 获取问卷（进行答题）
export const getSurveyTopicList = (projectKey?: string) => {
  return http.get(PORT1 + `/survey/project/view/${projectKey}`);
};
// 项目设置详细信息
export const getSurveySetting = params => {
  return http.get(PORT1 + `/survey/answer/setting/status`, params);
};
