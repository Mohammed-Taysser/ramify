# Base node image
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json yarn.lock ./

# Development & Builder Base
FROM base AS builder
RUN yarn install --frozen-lockfile
COPY . .

# Development stage
FROM builder AS development
EXPOSE 5173
CMD ["yarn", "run", "dev"]

# Build stage
FROM builder AS build-compiled
RUN yarn build

# Production stage
FROM nginx:alpine AS production
COPY --from=build-compiled /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
