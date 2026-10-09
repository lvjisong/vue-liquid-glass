/**
 * 节流：固定间隔内最多执行一次。
 * 场景：滚动监听、拖拽、高频按钮点击。
 */
export default function throttle(fn, interval = 300) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn.apply(this, args);
    }
  };
}
