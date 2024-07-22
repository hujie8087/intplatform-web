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
  { label: computed(() => I18n.global.t("dict.yes")).value, value: "1", tagType: "success" },
  { label: computed(() => I18n.global.t("dict.no")).value, value: "0", tagType: "danger" }
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
