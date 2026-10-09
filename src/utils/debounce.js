/**
 * 防抖：事件停止触发 delay 毫秒后才执行一次。
 * 场景：搜索输入、窗口 resize、导航 hover 面板切换（防快速划过闪烁）。
 */
export default function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
