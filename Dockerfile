# # 使用 Node 镜像进行构建
# FROM node:16 AS build-stage

# # 设置工作目录
# WORKDIR /app

# # 复制项目文件到工作目录
# COPY . .

# # 安装依赖并构建项目
# RUN npm install
# RUN npm run build

# 使用 Nginx 镜像进行服务
# public.ecr.aws/nginx/nginx:stable-alpine
FROM nginx:stable-alpine

# 复制构建的文件到 Nginx 服务器的默认文件夹
COPY dist/ /usr/share/nginx/html/

# 复制自定义的 Nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]

# docker buildx create --name mybuilder --driver docker-container --use
# docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7,linux/arm/v6,linux/ppc64le,linux/s390x,linux/386 -t jiugefront:latest --output "type=local,dest=./output-dir" .