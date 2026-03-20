import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { showFullScreenLoading, tryHideFullScreenLoading } from "@/components/Loading/fullScreen";
import { LOGIN_URL } from "@/config";
import { ElMessage, ElMessageBox } from "element-plus";
import { ResPage, Result, ResultData } from "@/api/interface";
import { ResultEnum } from "@/enums/httpEnum";
import { checkStatus } from "./helper/checkStatus";
import { AxiosCanceler } from "./helper/axiosCancel";
import { useUserStore } from "@/stores/modules/user";
import router from "@/routers";
import { markRaw } from "vue";
import { Warning } from "@element-plus/icons-vue";
import { tansParams } from "@/utils";
import { putLoginUser, refreshToken } from "./modules/login";

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  loading?: boolean;
  cancel?: boolean;
}

const config = {
  // 默认地址请求地址，可在 .env.** 文件中修改
  baseURL: import.meta.env.VITE_API_URL as string,
  // 设置超时时间
  timeout: ResultEnum.TIMEOUT as number,
  // 跨域时候允许携带凭证
  withCredentials: false
};

const axiosCanceler = new AxiosCanceler();

// 请求队列：存储 token 过期时的请求
interface PendingRequest {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
  config: CustomAxiosRequestConfig;
}

class RequestHttp {
  service: AxiosInstance;
  // 是否正在刷新 token
  private isRefreshing = false;
  // 待重试的请求队列
  private pendingQueue: PendingRequest[] = [];

  /**
   * @description 处理队列中的请求
   * @param error 如果提供错误，则所有请求都会 reject
   * @param newToken 新的 token，用于更新队列中请求的 headers
   */
  private processQueue(error: any = null, newToken?: string) {
    this.pendingQueue.forEach(({ resolve, reject, config }) => {
      if (error) {
        reject(error);
      } else {
        // 更新请求头中的 token（如果提供了新 token）
        if (newToken && config.headers && typeof config.headers.set === "function") {
          config.headers.set("access_token", newToken);
        }
        // 重新执行请求（请求拦截器会自动从 userStore 获取最新 token）
        this.service.request(config).then(resolve).catch(reject);
      }
    });
    this.pendingQueue = [];
  }

  public constructor(config: AxiosRequestConfig) {
    // instantiation
    this.service = axios.create(config);

    /**
     * @description 请求拦截器
     * 客户端发送请求 -> [请求拦截器] -> 服务器
     * token校验(JWT) : 接受服务器返回的 token,存储到 vuex/pinia/本地储存当中
     */
    this.service.interceptors.request.use(
      (config: CustomAxiosRequestConfig) => {
        const userStore = useUserStore();
        const token = userStore.token || localStorage.getItem("access_token");
        // 重复请求不需要取消，在 api 服务中通过指定的第三个参数: { cancel: false } 来控制
        config.cancel ??= true;
        config.cancel && axiosCanceler.addPending(config);
        // 当前请求不需要显示 loading，在 api 服务中通过指定的第三个参数: { loading: false } 来控制
        config.loading ??= true;
        config.loading && showFullScreenLoading();
        if (config.headers && typeof config.headers.set === "function") {
          config.headers.set("access_token", token);
          config.headers.set("product_code", "intplatform");
          config.headers.set("platform", "ADMIN");
          config.headers.set("version_name", "1.0.0");
          config.headers.set("version_code", "1");
          config.headers.set("os", "web");
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    /**
     * @description 响应拦截器
     *  服务器换返回信息 -> [拦截统一处理] -> 客户端JS获取到信息
     */
    this.service.interceptors.response.use(
      async (response: AxiosResponse & { config: CustomAxiosRequestConfig }) => {
        const { data, config } = response;

        const userStore = useUserStore();
        const refresh_Token = userStore.refreshToken || localStorage.getItem("refresh_token") || "";
        axiosCanceler.removePending(config);
        config.loading && tryHideFullScreenLoading();
        // token过期
        if (data.code == ResultEnum.TOKEN_EXPIRED || data.code === ResultEnum.OVERDUE) {
          // 如果正在刷新 token，将当前请求加入队列等待
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.pendingQueue.push({ resolve, reject, config });
            });
          }

          // 开始刷新 token
          this.isRefreshing = true;

          try {
            const res = await refreshToken({ refreshToken: refresh_Token });
            if (+res.code === ResultEnum.SUCCESS) {
              await userStore.setToken(res.data.accessToken);
              await userStore.setRefreshToken(res.data.refreshToken);

              await putLoginUser();
              // 更新请求头中的 token
              if (config.headers && typeof config.headers.set === "function") {
                config.headers.set("access_token", res.data.accessToken);
              }

              // 处理队列中的请求（传入新 token）
              this.processQueue(null, res.data.accessToken);
              this.isRefreshing = false;

              // 重新执行当前请求
              return this.service.request(config);
            } else {
              // 刷新失败，处理队列并跳转登录
              const error = { code: ResultEnum.TOKEN_EXPIRED, msg: res.msg || "刷新token失败" };
              this.processQueue(error);
              this.isRefreshing = false;
              router.replace(LOGIN_URL);
              return Promise.reject(error);
            }
          } catch (error) {
            // 刷新失败，处理队列并跳转登录
            const refreshError = { code: ResultEnum.TOKEN_EXPIRED, msg: "刷新token失败" };
            this.processQueue(refreshError);
            this.isRefreshing = false;
            router.replace(LOGIN_URL);
            return Promise.reject(refreshError);
          }
        }
        // 登录失效
        if (data.code == ResultEnum.OVERDUE || data.code == ResultEnum.REFRESH_TOKEN_EXPIRED) {
          userStore.setToken("");
          userStore.setRefreshToken("");
          router.replace(LOGIN_URL);
          ElMessage.error(data.msg || data.message);
          return Promise.reject(data);
        }
        // 全局错误信息拦截（防止下载文件的时候返回数据流，没有 code 直接报错）
        if (data.code && data.code !== ResultEnum.SUCCESS) {
          if (config.method === "post") {
            ElMessageBox.confirm(data.msg || data.message, "系统提示", {
              confirmButtonText: "确认",
              showCancelButton: false,
              type: "warning",
              icon: markRaw(Warning),
              dangerouslyUseHTMLString: true
            });
          } else {
            ElMessage.error(data.msg || data.message);
          }
          return Promise.reject(data);
        }
        // 成功请求（在页面上除非特殊情况，否则不用处理失败逻辑）
        return data;
      },
      async (error: AxiosError) => {
        const { response } = error;
        tryHideFullScreenLoading();
        // 请求超时 && 网络错误单独判断，没有 response
        if (error.message.indexOf("timeout") !== -1) ElMessage.error("请求超时！请您稍后重试");
        if (error.message.indexOf("Network Error") !== -1) ElMessage.error("网络错误！请您稍后重试");
        // 根据服务器响应的错误状态码，做不同的处理
        if (response) checkStatus(response.status);
        // 服务器结果都没有返回(可能服务器错误可能客户端断网)，断网处理:可以跳转到断网页面
        if (!window.navigator.onLine) router.replace("/500");
        return Promise.reject(error);
      }
    );
  }

  /**
   * @description 常用请求方法封装
   */
  get<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
    return this.service.get(url, { params, ..._object });
  }
  getRow<T>(url: string, params?: object, _object = {}): Promise<ResPage<T>> {
    return this.service.get(url, { params, ..._object });
  }
  // 拼接url并转码
  getUrl<T>(url: string, params?: object, _object = {}): Promise<T & Result> {
    let stringParams = tansParams({ ...params, ..._object });
    return this.service.get(url + "?" + stringParams, {});
  }
  getNoData<T>(url: string, params?: object, _object = {}): Promise<T & Result> {
    return this.service.get(url, { params, ..._object });
  }
  post<T>(url: string, params?: object | string, _object = {}): Promise<ResultData<T>> {
    return this.service.post(url, params, _object);
  }
  put<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
    return this.service.put(url, params, _object);
  }
  delete<T>(url: string, params?: any, _object = {}): Promise<ResultData<T>> {
    return this.service.delete(url, { params, ..._object });
  }
  download(url: string, params?: object, _object = {}): Promise<BlobPart> {
    return this.service.post(url, params, { ..._object, responseType: "blob" });
  }
}

export default new RequestHttp(config);
