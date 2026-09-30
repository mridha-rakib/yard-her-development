# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=http://localhost:9898/api/v1
ENV VITE_API_URL=${VITE_API_URL}
ENV NPM_CONFIG_FETCH_RETRIES=5
ENV NPM_CONFIG_FETCH_RETRY_FACTOR=2
ENV NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000
ENV NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000
ENV NPM_CONFIG_PREFER_OFFLINE=true
ENV NPM_CONFIG_AUDIT=false
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_PROGRESS=false

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm,id=yard-admin-npm-cache,sharing=locked \
    set -eux; \
    for attempt in 1 2 3 4; do \
      npm ci && break; \
      if [ "$attempt" -eq 4 ]; then exit 1; fi; \
      echo "npm ci failed on attempt $attempt, retrying..."; \
      sleep $((attempt * 10)); \
    done

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

RUN printf '%s\n' \
  'server {' \
  '  listen 80;' \
  '  server_name _;' \
  '  root /usr/share/nginx/html;' \
  '  index index.html;' \
  '' \
  '  location / {' \
  '    try_files $uri $uri/ /index.html;' \
  '  }' \
  '' \
  '  location /assets/ {' \
  '    add_header Cache-Control "public, max-age=31536000, immutable";' \
  '    try_files $uri =404;' \
  '  }' \
  '}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
