#!/bin/bash
# English Master —— 腾讯云轻量应用服务器 一键部署脚本
# 用法：把本脚本和 english-master.zip 一起传到服务器 /root 目录，然后执行：
#   cd /root && bash deploy.sh
set -e
echo "=== 开始部署 English Master ==="

# 1. 安装 Node.js 22（已装则跳过）
if ! command -v node >/dev/null 2>&1; then
  echo "[1/5] 安装 Node.js 22 ..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
else
  echo "[1/5] Node.js 已存在: $(node -v)"
fi

# 2. 准备项目目录（优先用上传的 zip；没有就 git 克隆）
cd /root
if [ ! -d "english-master" ]; then
  if [ -f "english-master.zip" ]; then
    echo "[2/5] 解压 english-master.zip ..."
    apt-get install -y unzip >/dev/null 2>&1
    rm -rf english-master_tmp
    unzip -o english-master.zip -d english-master_tmp >/dev/null
    if [ -d "english-master_tmp/english-master" ]; then
      mv english-master_tmp/english-master english-master
    else
      mv english-master_tmp english-master
    fi
    rm -rf english-master_tmp
  else
    echo "[2/5] 从 GitHub 克隆 ..."
    apt-get install -y git >/dev/null 2>&1
    git clone https://github.com/Xiaoyufeiyu/english-master.git
  fi
fi
cd /root/english-master

# 3. 安装 pm2 进程守护（崩溃自动重启、关机后自动拉起）
echo "[3/5] 安装 pm2 进程守护 ..."
npm install -g pm2 >/dev/null 2>&1

# 4. 启动服务（端口 80，数据写磁盘持久化）
echo "[4/5] 启动服务（端口 80）..."
PORT=80 EM_DATA=/root/english-master/data.json pm2 start server/server.js --name english-master
pm2 save

# 5. 设置开机自启
echo "[5/5] 设置开机自启 ..."
pm2 startup >/dev/null 2>&1 || true

echo "=== 部署完成 ==="
IP=$(curl -s https://api.ipify.org 2>/dev/null || echo "你的服务器公网IP")
echo "浏览器访问： http://${IP}   或   http://<默认域名>.lightcp.com"
echo "查看日志： pm2 logs english-master"
echo "重启服务： pm2 restart english-master"
