// 额度规则接口管理
import http from "@/api";
import { ExchangeRate, QuotaRules, TransactionDetails } from "../interface/onlineTopUp";
const baseURL = import.meta.env.VITE_API_HOME_URL;
/**
 * @name 额度规则管理模块
 */

// * 新增额度规则
export const addQuotaRules = (params: FormData) => {
  return http.post(`/mis/lms/mis/rule/save`, params, { baseURL: baseURL });
};

// * 编辑额度规则信息
export const editQuotaRules = (params: FormData) => {
  return http.put(`/mis/lms/mis/rule/put`, params, { baseURL: baseURL });
};

// * 删除额度规则信息
export const deleteQuotaRules = (ids: number[]) => {
  return http.put(`/mis/lms/mis/rule/delIds`, ids, { baseURL: baseURL });
};
// * 获取额度规则信息详情
export const getQuotaRulesById = (id: number) => {
  return http.get<QuotaRules.ResQuotaRules>(`/mis/lms/mis/rule/find/${id}`, {}, { baseURL: baseURL });
};

// * 获取额度规则列表
export const getQuotaRulesList = (params: QuotaRules.ReqQuotaRulesParams) => {
  return http.get<QuotaRules.ResQuotaRules>(`/mis/lms/mis/rule/page`, params, { baseURL: baseURL });
};

// * 流水明细查询
export const getTransactionDetailsList = (params: TransactionDetails.ReqTransactionDetailsParams) => {
  return http.get<TransactionDetails.ResTransactionDetails>(`/mis/lms/mis/record/page`, params, { baseURL: baseURL });
};

// * 流水明细查询
export const getTransactionDetailsById = (id: number) => {
  return http.get<TransactionDetails.ResTransactionDetails>(`/mis/lms/mis/record/find/${id}`, {}, { baseURL: baseURL });
};

// * 新增汇率
export const addExchangeRate = (params: FormData) => {
  return http.post(`/mis/lms/mis/month/save`, params, { baseURL: baseURL });
};

// * 编辑汇率信息
export const editExchangeRate = (params: FormData) => {
  return http.put(`/mis/lms/mis/month/put`, params, { baseURL: baseURL });
};

// * 删除汇率信息
export const deleteExchangeRate = (ids: number[]) => {
  return http.put(`/mis/lms/mis/month/delIds`, ids, { baseURL: baseURL });
};
// * 获取汇率信息详情
export const getExchangeRateById = (id: number) => {
  return http.get<ExchangeRate.ResExchangeRate>(`/mis/lms/mis/month/find/${id}`, {}, { baseURL: baseURL });
};

// * 获取汇率列表
export const getExchangeRateList = (params: ExchangeRate.ReqExchangeRateParams) => {
  return http.get<ExchangeRate.ResExchangeRate>(`/mis/lms/mis/month/page`, params, { baseURL: baseURL });
};
