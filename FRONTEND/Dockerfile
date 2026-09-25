FROM node:18-alpine

WORKDIR /app

# Bağımlılıkları kuralım
COPY package*.json ./
RUN npm install

# Kaynak kodları kopyalayalım
COPY . .

# API adresi build sırasında Next.js bundle'ına gömülür
ARG NEXT_PUBLIC_API_BASE=https://api.ayzek22.com.tr
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE

# Next.js build alalım
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
