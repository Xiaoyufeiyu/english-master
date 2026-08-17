# English Master — Hugging Face Spaces (Docker SDK) 部署配置
FROM node:18-alpine

WORKDIR /app

# 安装依赖（本项目零依赖，这一步基本为空，保留以便将来扩展）
COPY package.json ./
RUN npm install --omit=dev || true

# 复制全部应用代码（含 bulkwords.js 词库）
COPY . .

# Hugging Face Spaces 只把流量导向 7860 端口
ENV PORT=7860
EXPOSE 7860

CMD ["npm", "start"]
