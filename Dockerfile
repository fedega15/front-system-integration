# Etapa de construcción
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm ci

COPY . .
RUN npm run build

# Etapa de producción
FROM node:20-slim

WORKDIR /app

# Instalar dependencias esenciales (openssl para crypto)
RUN apt-get update && apt-get install -y openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

ENV NODE_ENV=production
ENV PORT=8081

# Usuario no-root para seguridad
RUN chown -R node:node /app
USER node

EXPOSE ${PORT}
CMD ["node", "dist/main.js"]