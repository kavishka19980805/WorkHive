FROM node:20-alpine

WORKDIR /app

# Install build dependencies (needed for some native packages if any, though we use bcryptjs)
RUN apk add --no-cache libc6-compat openssl

COPY package*.json ./

RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["node", "dist/index.js"]
