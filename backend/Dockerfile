FROM node:22-alpine

WORKDIR /app

# Chỉ copy file package trước để tận dụng cơ chế cache của Docker khi cài thư viện
COPY package*.json ./

RUN npm install

# Copy toàn bộ mã nguồn còn lại vào container
COPY . .

EXPOSE 5000

# Chạy lệnh phát triển (thường hỗ trợ nodemon để tự reload khi sửa code)
CMD ["npm", "run", "dev"]