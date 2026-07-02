# Dockerfile for React + Vite Production Build
FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_BASE_URL=http://localhost:8081/v1/api
ARG VITE_APP_TIMEZONE=America/Mexico_City
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_TIMEZONE=$VITE_APP_TIMEZONE

COPY package*.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN npm run build

# Production image
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/dist .
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8085
CMD ["nginx", "-g", "daemon off;"]
