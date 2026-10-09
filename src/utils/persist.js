/**
 * 通用 localStorage 持久化工具。
 * 用法：const persistPrefs = createPersist("app_prefs"); // key 按模块命名
 *  - persistPrefs.load()        初始化时读回（解析失败返回默认值）
 *  - persistPrefs.save(data)    变更后写入
 *  - persistPrefs.clear()       清空
 */
export function createPersist(key, fallback = null) {
  return {
    load() {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback; // 解析失败返回默认值，不报错
      }
    },
    save(data) {
      localStorage.setItem(key, JSON.stringify(data));
    },
    clear() {
      localStorage.removeItem(key);
    },
  };
}
