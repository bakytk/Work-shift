
# build step
FROM node:14-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig*.json ./
COPY src src
RUN npm run build

# run step
FROM node:14-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY --from=builder /app/dist/ dist/
EXPOSE 15500
ENTRYPOINT [ "npm", "start"]
