FROM node:20-alpine

WORKDIR /app

# Copie package.json et package-lock.json d'abord pour le cache Docker
COPY package*.json ./

# Install packages
RUN npm install
RUN npm install --save-dev ts-node ts-node-dev typescript tsconfig-paths @types/node @types/bcrypt @types/jsonwebtoken @types/qrcode
RUN npm install bcrypt jsonwebtoken fastify @fastify/cookie @fastify/websocket @fastify/sensible @fastify/multipart @fastify/static sharp ws @types/ws better-sqlite3 prom-client otplib qrcode

# Copie le code
COPY . .

# Expose port
EXPOSE 4000

# Start dev
CMD ["npm", "run", "dev"]
