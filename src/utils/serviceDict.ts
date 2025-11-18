import { computed } from "vue";
// * 系统全局字典
import I18n from "@/languages/index";

/**
 * @description：用户性别
 */
export const genderType = [
  { label: computed(() => I18n.global.t("dict.man")).value, value: "0" },
  { label: computed(() => I18n.global.t("dict.woman")).value, value: "1" },
  { label: computed(() => I18n.global.t("dict.unknown")).value, value: "2" }
];

export const sexType = [
  { label: computed(() => I18n.global.t("dict.man")).value, value: 1 },
  { label: computed(() => I18n.global.t("dict.woman")).value, value: 0 },
  { label: computed(() => I18n.global.t("dict.unknown")).value, value: 2 }
];

/**
 * @description：用户类型
 */
export const userType = [
  { label: computed(() => I18n.global.t("dict.systemUser")).value, value: "00", tagType: "success" },
  { label: computed(() => I18n.global.t("dict.appUser")).value, value: "01", tagType: "danger" }
];

/**
 * @description：用户国籍
 */
export const citizenshipType = [
  { label: computed(() => I18n.global.t("dict.indonesia")).value, value: 0 },
  { label: computed(() => I18n.global.t("dict.china")).value, value: 1 },
  { label: computed(() => I18n.global.t("dict.chinese")).value, value: 2 }
];

/**
 * @description：用户状态
 */
export const userStatus = [
  { label: I18n.global.t("dict.enable"), value: "0", tagType: "success" },
  { label: I18n.global.t("dict.disable"), value: "1", tagType: "danger" }
];
/**
 * @description：激活状态
 */
export const activeStateOption = [
  { label: I18n.global.t("main.no"), value: 0, tagType: "danger" },
  { label: I18n.global.t("main.yes"), value: 1, tagType: "success" }
];

/**
 * @description：是否显示
 */
export const visibleType = [
  { label: computed(() => I18n.global.t("dict.hidden")).value, value: "1", tagType: "danger" },
  { label: computed(() => I18n.global.t("dict.visible")).value, value: "0", tagType: "success" }
];

/**
 * @description：是否
 */
export const yesOrNoOptions = [
  { label: computed(() => I18n.global.t("dict.yes")).value, value: "Y", tagType: "success" },
  { label: computed(() => I18n.global.t("dict.no")).value, value: "N", tagType: "danger" }
];

/**
 * @description：是否
 */
export const systemConfigOptions = [
  { label: computed(() => I18n.global.t("dict.yes")).value, value: "Y", tagType: "success" },
  { label: computed(() => I18n.global.t("dict.no")).value, value: "N", tagType: "danger" }
];
/**
 * @description：回显样式字典
 */
export const listClassOptions = [
  { label: computed(() => I18n.global.t("dict.default")).value, value: "default" },
  { label: computed(() => I18n.global.t("dict.primary")).value, value: "primary" },
  { label: computed(() => I18n.global.t("dict.success")).value, value: "success" },
  { label: computed(() => I18n.global.t("dict.info")).value, value: "info" },
  { label: computed(() => I18n.global.t("dict.warning")).value, value: "warning" },
  { label: computed(() => I18n.global.t("dict.danger")).value, value: "danger" }
];

/**
 * @description：审核状态
 */
export const auditStatus = [
  { label: computed(() => I18n.global.t("dict.firstAudit")).value, value: "1" },
  { label: computed(() => I18n.global.t("dict.secondAudit")).value, value: "2" },
  { label: computed(() => I18n.global.t("dict.audit")).value, value: "3" },
  { label: computed(() => I18n.global.t("dict.thirdAudit")).value, value: "4" }
];

/**
 * @description：状态颜色
 */
export const tagTypeOptions = ["success", "danger", "warning", "info", "primary", "error"];
/**
 * @description：共用状态
 */
export const commonStatus = [
  { label: I18n.global.t("dict.enable"), value: 0, tagType: "success" },
  { label: I18n.global.t("dict.disable"), value: 1, tagType: "danger" }
];

// 宗教
export const religionOptions = [
  { label: computed(() => I18n.global.t("religion.unknown")).value, value: "0" },
  { label: computed(() => I18n.global.t("religion.islam")).value, value: "1" },
  { label: computed(() => I18n.global.t("religion.christianity")).value, value: "2" },
  { label: computed(() => I18n.global.t("religion.buddhism")).value, value: "3" },
  { label: computed(() => I18n.global.t("religion.catholicism")).value, value: "4" },
  { label: computed(() => I18n.global.t("religion.confucianism")).value, value: "5" },
  { label: computed(() => I18n.global.t("religion.hinduism")).value, value: "6" },
  { label: computed(() => I18n.global.t("religion.beliefInOneAlmightyGod")).value, value: "7" }
];
