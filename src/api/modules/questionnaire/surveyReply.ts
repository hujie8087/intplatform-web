import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
// 获取问卷回复列表
export const getSurveyReply = params => {
  return http.get(PORT1 + `/survey/project/reply/list`, params);
};

// 新增问卷回复
export const addSurveyReply = params => {
  return http.post(PORT1 + `/survey/project/reply`, params);
};
// 修改问卷回复
export const editSurveyReply = params => {
  return http.put(PORT1 + `/survey/project/reply`, params);
};
// 删除问卷回复
export const deleteSurveyReply = ids => {
  return http.delete(PORT1 + `/survey/project/reply/${ids}`);
};
