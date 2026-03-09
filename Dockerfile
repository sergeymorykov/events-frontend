FROM node:18-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE_URL
ARG VITE_BETA_CONSENT_REQUIRED

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_BETA_CONSENT_REQUIRED=${VITE_BETA_CONSENT_REQUIRED}

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build


FROM node:18-alpine AS production

LABEL maintainer="rebbit123456@gmail.com"
LABEL version="1.0"

RUN addgroup -g 1001 nodejs && \
    adduser -u 1001 -G nodejs -D -H -s /bin/sh frontend

WORKDIR /app

RUN npm install -g serve@14.2.0 --ignore-scripts

COPY --from=builder --chown=frontend:nodejs /app/dist ./dist

USER frontend

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

EXPOSE 3000

ENV NODE_ENV=production

CMD ["serve", "-s", "dist", "-l", "3000", "--no-clipboard"]