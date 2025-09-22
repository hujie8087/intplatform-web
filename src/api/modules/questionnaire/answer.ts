import { PORT1 } from "@/api/config/servicePort";
import { AnswerType } from "@/api/interface/questionnaire/answer";
import http from "@/api";
// 获取回答列表
export const getAnswerList = (params: AnswerType.ReqAnswerParams) => {
  return http.get(PORT1 + `/survey/answer/list`, { ...params });
};
// 删除回答
export const deleteAnswer = (id: number) => {
  return http.delete(PORT1 + `/survey/answer/${id}`);
};
// 获取回答结果明细
export const getAnswerResult = (id: number, projectKey: string) => {
  return http.post(PORT1 + `/survey/answer/result/dtl`, { id, projectKey });
};
// 导出问答明细
export const exportAnswerResult = (projectKey: string) => {
  return http.get(PORT1 + `/survey/report/answer/${projectKey}`);
};
