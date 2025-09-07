export namespace SurveySetting {
  export interface getInfo {
    data: SettingItem;
    msg: string;
    code: number;
  }

  export interface save {
    msg: string;
    code: number;
  }

  export interface SettingItem {
    id: number;
    projectKey: string;
    submitPromptImg: string;
    submitPromptText: string;
    submitJumpUrl: string;
    isPublicResult: Boolean;
    isEveryoneWriteOnce: Boolean;
    isEveryoneDayWriteOnce: Boolean;
    writeOncePromptText: string;
    newWriteNotifyEmail: string;
    timedCollectionBeginTime: string;
    timedCollectionEndTime: string;
    timedNotEnabledPromptText: string;
    timedDeactivatePromptText: string;
    timedQuantitativeQuantity: number;
    timedEndPromptText: string;
    shareImg: string;
    shareTitle: string;
    shareDesc: string;
    isValidEmployeeNo: boolean;
    validEmployeeNoPromptText: string;
    createBy: string;
    createTime: string;
    updateBy: string | null;
    updateTime: string | null;
  }
}
