# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage: запуск статического сервера
FROM node:18-alpine

WORKDIR /app

# Устанавливаем только serve (минималистичный сервер)
RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Запускаем сервер на порту 3000
CMD ["serve", "-s", "dist", "-l", "3000"]