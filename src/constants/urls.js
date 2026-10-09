/**
 * 所有外部链接/域名集中管理，改域名/路径只改这一处。
 * 组件里 import 后用模板字符串拼接，禁止在 DOM 里写死完整 URL。
 */
export const SITE = "<-- 按项目替换：主站域名 -->";
export const ACCOUNT = "<-- 按项目替换：账户域名 -->";

export const SHOP = {
  store: `${SITE}/shop`,
  orderList: `${SITE}/shop/order/list`,
  // ... 按业务扩展
};

export const PRODUCT = {
  home: `${SITE}/product-a`,
  list: `${SITE}/product-b`,
  // ... 按业务扩展
};

// 导航 / 页脚 / 卡片链接分组（按业务拆对象）
export const NAV_TOP = {
  /* ... */
};
export const FOOTER_LINKS = {
  /* ... */
};
