FROM node:20-alpine
WORKDIR /app

# Déps d'abord (cache-friendly)
COPY package*.json ./
RUN npm ci --only=production || npm install --only=production

# Code
COPY . .

# Le port est injecté par docker-compose via l'env PORT
ENV HOST=0.0.0.0
EXPOSE 3000
CMD ["node", "server.js"]
