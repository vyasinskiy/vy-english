# Stage 1: build application
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json ./
COPY server ./server
RUN npm run build:server
COPY client ./client
RUN cd client && npm install && npm run build

# Stage 2: production image
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm install --only=production \ 
    && npx prisma generate
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/build ./client/build
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "dist/server/index.js"]
