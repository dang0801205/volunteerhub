FROM node:22-alpine

WORKDIR /app

# Copy cả package.json và package-lock.json để cố định phiên bản thư viện
COPY package*.json ./

# Cài đặt các gói phụ thuộc bên trong môi trường ảo
RUN npm install

# Copy toàn bộ mã nguồn frontend vào container
COPY . .

# Mở cổng 5173 (Cổng mặc định của hệ thống Vite)
EXPOSE 5173

# ĐẶC BIỆT QUAN TRỌNG: Cờ --host giúp Vite lắng nghe kết nối từ bên ngoài container
CMD ["npm", "run", "dev", "--", "--host"]