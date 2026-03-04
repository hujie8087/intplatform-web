import { ThirdReqPage } from ".";

// * 额度规则管理模块
export namespace QuotaRules {
  export type ReqQuotaRulesParams = ThirdReqPage;
  export interface ResQuotaRules {
    id: number;
    formatOrganizeName: string;
    monthQuota: string;
    dayQuota: string;
    enableNewUser: boolean;
  }
}

// * 流水明细管理模块
export namespace TransactionDetails {
  export type ReqTransactionDetailsParams = ThirdReqPage;
  export interface ResTransactionDetails {
    id: number;
    yearMonth: string;
    userId: string;
    account: string;
    name: string;
    amount: string;
    createTime: string;
    status: string;
    sign: string;
    no: string;
    deductedMonths: string;
  }
}

// * 汇率管理模块
export namespace ExchangeRate {
  export type ReqExchangeRateParams = ThirdReqPage;
  export interface ResExchangeRate {
    id: number;
    yearMonth: string;
    currency: string;
    exchangeRate: string;
  }
}
