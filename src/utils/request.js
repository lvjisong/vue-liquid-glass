import axios from "axios";
import { ElMessage as Message } from "element-plus";
import auth from "@/utils/auth";

// ===== Token 存取：统一走 auth.js，不直接读写 localStorage =====
function getToken() {
  return auth.getToken() || "";
}
function getRefreshToken() {
  return auth.getRefreshToken() || "";
}
function setTokens(t) {
  auth.setToken(t);
}
function clearTokens() {
  auth.logout();
}

// ===== 自动刷新 token 配置 =====
const REFRESH_URL = "/auth/refresh"; // <-- 按项目替换：刷新接口
let isRefreshing = false;
let waitQueue = [];

function redirectToLogin() {
  if (window.location && !window.location.pathname.includes("/login")) {
    window.location.href = "/login";
  }
}

async function requestNewToken() {
  const res = await axios.post(REFRESH_URL, { refresh_token: getRefreshToken() });
  const payload = res && res.data && res.data.data;
  if (!payload || !payload.token) throw new Error("刷新 token 响应结构异常");
  setTokens(payload.token);
  return payload.token;
}

const isBizOk = (code) => code === 0 || code === 200;
const getBizMsg = (res) => (res && (res.msg || res.message)) || "业务处理失败";

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || "",
  timeout: 120000,
});

// ===== 请求拦截器：注入 token + FormData 处理 =====
service.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = "Bearer " + token;
    if (config.data instanceof FormData) delete config.headers["Content-Type"]; // 上传必须让浏览器带 multipart boundary
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== 响应拦截器：解包 + 自动刷新 token + GET 重试 + 错误映射 =====
service.interceptors.response.use(
  (response) => {
    const config = response.config || {};
    const res = response.data;
    if (config.responseType === "blob" || config.responseType === "arraybuffer") return res; // 二进制流原样返回
    if (res && typeof res === "object" && "code" in res) {
      if (!isBizOk(res.code)) {
        const bizMsg = getBizMsg(res);
        if (!config.silentError) Message.error(bizMsg);
        return Promise.reject(new Error(bizMsg));
      }
      return res.data !== undefined ? res.data : res;
    }
    return res;
  },
  async (error) => {
    const config = error.config || {};
    const status = error.response && error.response.status;

    // ===== 分支零：GET 自动重试（网络抖动/5xx）。POST 有副作用默认不重试 =====
    const shouldRetry =
      config.retry !== false && (config.retry === true || config.method === "get");
    if (shouldRetry && (config._retryCount || 0) < 2 && !status) {
      config._retryCount = (config._retryCount || 0) + 1;
      await new Promise((r) => setTimeout(r, 1000 * config._retryCount)); // 指数退避 1s/2s
      return service(config);
    }

    // ===== 分支一：401 自动刷新 token（单飞去重 + 排队重试） =====
    if (status === 401 && !config._retried && !(config.url || "").includes(REFRESH_URL)) {
      if (!getRefreshToken()) {
        clearTokens();
        redirectToLogin();
        if (!config.silentError) Message.error("登录已过期，请重新登录");
        return Promise.reject(error);
      }
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          waitQueue.push((tok, isErr) => {
            if (isErr) return reject(tok);
            config._retried = true;
            resolve(service(config));
          });
        });
      }
      isRefreshing = true;
      return requestNewToken()
        .then((tok) => {
          isRefreshing = false;
          const pending = waitQueue;
          waitQueue = [];
          pending.forEach((cb) => cb(tok, false));
          config._retried = true;
          return service(config);
        })
        .catch((err) => {
          isRefreshing = false;
          const pending = waitQueue;
          waitQueue = [];
          pending.forEach((cb) => cb(err, true));
          clearTokens();
          redirectToLogin();
          if (!config.silentError) Message.error("登录已过期，请重新登录");
          return Promise.reject(err);
        });
    }

    // ===== 分支二：其余错误 → 中文提示 =====
    let msg = "";
    if (error.response) {
      msg =
        {
          400: "请求参数错误",
          401: "登录已过期",
          403: "没有权限",
          404: "资源不存在",
          405: "方法不允许",
          429: "请求过于频繁",
          500: "服务器内部错误",
          502: "网关错误",
          503: "服务暂不可用",
          504: "网关超时",
        }[status] || "请求失败（HTTP " + status + "）";
    } else if (error.code === "ECONNABORTED" || /timeout/i.test(error.message || "")) {
      msg = "请求超时，请稍后重试";
    } else if (error.request) {
      msg = "网络异常，请检查网络连接";
    } else {
      msg = (error && error.message) || "未知错误";
    }
    if (!config.silentError) Message.error(msg);
    return Promise.reject(new Error(msg));
  }
);

export default service;
