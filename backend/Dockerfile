FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
COPY prisma ./prisma
RUN yarn install --frozen-lockfile

COPY . .
RUN npx prisma generate
RUN yarn build

FROM node:20-alpine

WORKDIR /app

# Copy production dependencies and generated prisma client
COPY package.json yarn.lock ./
COPY prisma ./prisma
RUN yarn install --production --frozen-lockfile && npx prisma generate

# Copy built assets and required runtime folders
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/docs ./docs
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 8080

# Run using validated entries
CMD ["node", "-r", "tsconfig-paths/register", "dist/src/server.js"]
