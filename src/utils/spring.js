/**
 * 弹簧物理引擎：基于 requestAnimationFrame 驱动，遵循 Apple 弹簧设计参数。
 * 特点：从当前值/初速度开始、可随时打断、过冲回弹，避免 CSS keyframes 的"砖墙"感。
 *
 * 用法：
 *   const anim = animateSpring({
 *     from: 0, to: 1,
 *     stiffness: 190,  // 刚度 k（越大越硬）
 *     damping: 22,     // 阻尼 c（越小越弹，Apple 弹窗常用 ~22）
 *     velocity: 0,     // 初始速度（接管手势时传入手指速度）
 *     onUpdate: (value, velocity) => {}, // 每帧更新样式
 *     onComplete: () => {},
 *     immediate: false, // 供"减弱动态效果"使用，直接跳目标
 *   });
 *   anim.cancel(); // 可随时打断
 */
export function animateSpring({
  from = 0,
  to = 1,
  stiffness = 190,
  damping = 22,
  velocity = 0,
  onUpdate,
  onComplete,
  immediate = false,
}) {
  let raf = null;
  let current = from;
  let vel = velocity;
  let lastTime = null;

  const cancel = () => {
    if (raf !== null) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  };

  if (immediate) {
    onUpdate(to);
    onComplete && onComplete();
    return { cancel };
  }

  const step = (time) => {
    if (lastTime === null) lastTime = time;
    let dt = (time - lastTime) / 1000;
    lastTime = time;
    if (dt > 0.05) dt = 0.05; // 切后台/掉帧限制步长，防数值爆炸
    if (dt > 0) {
      // 弹簧运动方程：F = -k*(x - target) - c*v
      vel += (-stiffness * (current - to) - damping * vel) * dt;
      current += vel * dt;
      onUpdate(current, vel);
      if (Math.abs(to - current) < 0.0005 && Math.abs(vel) < 0.0005) {
        onUpdate(to);
        onComplete && onComplete();
        return;
      }
    }
    raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return { cancel };
}
