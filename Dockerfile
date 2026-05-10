FROM node:20-alpine AS node-builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_APP_TITLE=Pulley\ Playground
ARG VITE_BASE_PATH=/
ARG VITE_ENABLE_SOUND=true

ENV VITE_APP_TITLE="${VITE_APP_TITLE}"
ENV VITE_BASE_PATH="${VITE_BASE_PATH}"
ENV VITE_ENABLE_SOUND="${VITE_ENABLE_SOUND}"

RUN pnpm build

FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=node-builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
