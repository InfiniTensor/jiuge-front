# 使用方法

## 介绍

+ 本前端项目是适配九格大模型服务api的对应前端实现，支持分支对话
  
+ 增加了对于开源大模型的对话支持，后续考虑增加对开源大模型的分支对话实现

+ 项目使用 `vue3` + `vite` 搭建，`node`版本需要 `>= 16`

+ dist目录是前端打包后的文件，需要使用某种载体使其运行

## 方法一：源码方式运行，支持自定义修改

+ 安装nodejs

```
npm install
```

```
npm run dev
```

项目默认运行在本地的`8011`端口


## 方法二：使用静态服务器

项目已经经过打包，生成了`dist`目录

+ 安装nodejs

+ 配置简单服务器

```
npm install -g http-server
http-server dist -p 8080
```
或者
```
npm install -g serve
serve -s dist -l 8080
```

## 方法三：使用nginx

+ 需要自行安装nginx

+ 其中nginx配置文件`nginx.conf`已经提供，替换`nginx/conf/nginx.conf`文件即可

+ `dist`目录放进 `nginx/html` 目录下
  
+ 启动nginx即可


```
#user  nobody;
worker_processes  1;

#pid        logs/nginx.pid;


events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    server {
        listen       80;
        server_name  jiuge-frontend;

        location / {
            root /绝对路径/nginx/html;
            index  index.html index.htm;
            try_files $uri $uri/ @router;
        }
        
        location @router {
            rewrite ^.*$ /index.html last;
        }

    }
}
```

## 方法四：使用 docker

+ 分别生成了各个平台下的docker镜像，在目录docker下，包含nginx和前端项目，一键启动即可

  + linux/amd64
  + linux/arm64
  + linux/arm/v7
  + linux/arm/v6
  + linux/ppc64le
  + linux/s390x
  + linux/386

```
docker load -i jiuge_latest_xx.tar
```

其中8080是本地端口，可以修改
```
docker run -d -p 8080:80 jiuge-xx:latest
```
