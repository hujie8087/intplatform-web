import { computed } from "vue";
// * 系统全局字典
import I18n from "@/languages/index";

/**
 * @description：用户性别
 */
export const genderType = [
  { label: computed(() => I18n.global.t("dict.man")), value: "1" },
  { label: computed(() => I18n.global.t("dict.woman")), value: "0" }
];

/**
 * @description：用户国籍
 */
export const citizenshipType = [
  { label: computed(() => I18n.global.t("dict.indonesia")), value: 0 },
  { label: computed(() => I18n.global.t("dict.china")), value: 1 },
  { label: computed(() => I18n.global.t("dict.chinese")), value: 2 }
];

/**
 * @description：用户状态
 */
export const userStatus = [
  { label: I18n.global.t("dict.enable"), value: 1 },
  { label: I18n.global.t("dict.disable"), value: 0 }
];

/**
 * @description：部门类型
 */
export const deptTypeStatus = [
  { label: I18n.global.t("system.dept.company"), value: 1 },
  { label: I18n.global.t("system.dept.dept"), value: 2 }
];

/**
 * @description：发放钥匙状态
 */
export const keyType = [
  { label: computed(() => I18n.global.t("dict.notIssued")), value: 0 },
  { label: computed(() => I18n.global.t("dict.issued")), value: 1 }
];

/**
 * @description：退回钥匙状态
 */
export const returnKeyType = [
  { label: computed(() => I18n.global.t("dict.notIssued")), value: 0 },
  { label: computed(() => I18n.global.t("dict.issued")), value: 1 },
  { label: computed(() => I18n.global.t("dict.returned")), value: 2 }
];
/**
 * @description：是否显示
 */
export const visibleType = [
  { label: computed(() => I18n.global.t("dict.hidden")), value: "1" },
  { label: computed(() => I18n.global.t("dict.visible")), value: "0" }
];

/**
 * @description：是否
 */
export const yesOrNoOptions = [
  { label: computed(() => I18n.global.t("dict.yes")).value, value: "1" },
  { label: computed(() => I18n.global.t("dict.no")).value, value: "0" }
];

/**
 * @description：回显样式字典
 */
export const listClassOptions = [
  { label: computed(() => I18n.global.t("dict.default")), value: "default" },
  { label: computed(() => I18n.global.t("dict.primary")), value: "primary" },
  { label: computed(() => I18n.global.t("dict.success")), value: "success" },
  { label: computed(() => I18n.global.t("dict.info")), value: "info" },
  { label: computed(() => I18n.global.t("dict.warning")), value: "warning" },
  { label: computed(() => I18n.global.t("dict.danger")), value: "danger" }
];

/**
 * @description：是否
 */
export const yOrNOptions = [
  { label: computed(() => I18n.global.t("dict.yes")).value, value: "Y", tagType: "" },
  { label: computed(() => I18n.global.t("dict.no")).value, value: "N", tagType: "danger" }
];
