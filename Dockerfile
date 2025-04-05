# Stage 1: build
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2: run
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app /app
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
