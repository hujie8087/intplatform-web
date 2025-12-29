import { Login, ResPage, Result } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
import authMenuList from "@/assets/json/authMenuList.json";
import authButtonList from "@/assets/json/authButtonList.json";
import http from "@/api";
import { Account, Menu } from "../interface/system";
const baseURL = import.meta.env.VITE_API_HOME_URL;

/**
 * @name 登录模块
 */
// 用户登录
export const loginApi = (params: Login.ReqLoginForm) => {
  // return http.post<Login.ResLogin>(PORT1 + `/auth/login`, params, { loading: false }); // 正常 post json 请求  ==>  application/json
  return http.post<Login.ResLogin>(`/mis/sso/mis/sso/login`, params, { baseURL: baseURL });
  // return http.post<Login.ResLogin>(PORT1 + `/login`, params, { loading: false }); // 控制当前请求不显示 loading
  // return http.post<Login.ResLogin>(PORT1 + `/login`, {}, { params }); // post 请求携带 query 参数  ==>  ?username=admin&password=123456
  // return http.post<Login.ResLogin>(PORT1 + `/login`, qs.stringify(params)); // post 请求携带表单参数  ==>  application/x-www-form-urlencoded
  // return http.get<Login.ResLogin>(PORT1 + `/login?${qs.stringify(params, { arrayFormat: "repeat" })}`); // get 请求可以携带数组等复杂参数
};

// 获取用户信息
export const getUserInfoApi = () => {
  return http.get<Login.ResThirdUserInfo>(PORT1 + `/home/upms/home/user/findInfo`, {}, { baseURL: baseURL });
};
// 获取用户权限信息
export const getUserPermissionInfoApi = () => {
  return http.get<Login.ResUserInfo>(PORT1 + `/system/user/getInfo`);
};

// 获取未分配用户列表
export const getUnallocatedUserList = (params: any) => {
  return http.get<ResPage<Account.ResAccountList>>(`/mis/upms/mis/user/page`, params, { baseURL: baseURL });
};

// 登录成功回调
export const putLoginUser = () => {
  return http.post<Result>(PORT1 + `/auth/putLoginUser`);
};

// 获取菜单列表
export const getAuthMenuListApi = () => {
  return http.get<Menu.MenuOptions[]>(PORT1 + `/system/menu/getRouters`, {}, { loading: false });
  // 如果想让菜单变为本地数据，注释上一行代码，并引入本地 authMenuList.json 数据
  return authMenuList;
};

// 获取按钮权限
export const getAuthButtonListApi = () => {
  // return http.get<Login.ResAuthButtons>(PORT1 + `/auth/buttons`, {}, { loading: false });
  // 如果想让按钮权限变为本地数据，注释上一行代码，并引入本地 authButtonList.json 数据
  return authButtonList;
};

// 用户退出登录
export const logoutApi = () => {
  return http.delete(PORT1 + `/auth/logout`);
};

// 储存用户设备token
export const saveUserMobilePhoneId = (params: { mobilePhoneId: string }) => {
  return http.put(PORT1 + `/system/user/addToken`, params);
};

// 修改密码
export const changePassword = (params: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
  return http.put<Result>(PORT1 + `/home/upms/home/user/putUserPassword`, params, { baseURL: baseURL });
};
// 首次登录修改密码
export const firstLoginChangePassword = (params: {
  code: string;
  account: string;
  password: string;
  confirmPassword: string;
}) => {
  return http.put<Result>(PORT1 + `/mis/sso/mis/sso/resetFirstPassword`, params, { baseURL: baseURL });
};

// 刷新token
export const refreshToken = (params: { refreshToken: string }) => {
  return http.put<Login.ResLogin>(PORT1 + `/mis/sso/mis/sso/refreshToken?refreshToken=${params.refreshToken}`, params, {
    baseURL: baseURL
  });
};
