import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { User } from "@/api/interface/mealDelivery/system/user";

// 查询用户列表
export function listUser(query) {
  return http.get<User.ResUser>(PORT1 + "/system/mdc/user/list", query);
}

// 查询用户详细
export function getUser(userId) {
  return http.get<User.ResUser>(PORT1 + "/system/mdc/user/" + userId);
}

// 新增用户
export function addUser(data) {
  return http.post<User.ResUser>(PORT1 + "/system/mdc/user", data);
}

// 修改用户
export function updateUser(data) {
  return http.put<User.ResUser>(PORT1 + "/system/mdc/user", data);
}

// 删除用户
export function delUser(userIds) {
  return http.delete(PORT1 + "/system/mdc/user/" + userIds);
}

// 用户密码重置
export function resetUserPwd(userId, password) {
  const data = {
    userId,
    password
  };
  return http.put<User.ResUser>(PORT1 + "/system/mdc/user/resetPwd", data);
}

// 用户状态修改
export function changeUserStatus(data) {
  return http.put(PORT1 + "/system/mdc/user/changeStatus", data);
}

// 查询用户个人信息
export function getUserProfile() {
  return http.get(PORT1 + "/system/mdc/user/profile");
}

// 修改用户个人信息
export function updateUserProfile(data) {
  return http.put(PORT1 + "/system/mdc/user/profile", data);
}

// 用户密码重置
export function updateUserPwd(data) {
  return http.put(PORT1 + "/system/mdc/user/profile/updatePwd", data);
}

// 用户头像上传
export function uploadAvatar(data) {
  return http.post(PORT1 + "/system/mdc/user/profile/avatar", data);
}

// 查询授权角色
export function getAuthRole(userId) {
  return http.get(PORT1 + "/system/mdc/user/authRole/" + userId);
}

// 保存授权角色
export function updateAuthRole(data) {
  return http.put(PORT1 + "/system/mdc/user/authRole", data);
}

// 查询部门下拉树结构
export function deptTreeSelect() {
  return http.get(PORT1 + "/system/mdc/user/deptTree");
}
