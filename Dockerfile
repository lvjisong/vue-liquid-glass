# ============================================================
# Dockerfile —— 多阶段构建：node 编译 → nginx 静态托管
#   阶段1（build）：装依赖、跑 npm run build 产出 dist/
#   阶段2（runtime）：只拷贝 dist 和 nginx.conf，最终镜像不带 node
# ============================================================
# <-- 按项目替换：node 版本与 nginx 镜像 -->
FROM node:22-alpine AS build
WORKDIR /app

# 构建期不需要 git hooks，跳过 husky 安装（镜像里没有 .git）
ENV HUSKY=0
ENV CI=true

# 先只拷 package.json + lock 文件做依赖层缓存
COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
