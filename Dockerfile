
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY tsconfig.json vite.config.js ./
COPY src ./src

EXPOSE 3000

CMD ["npm", "run", "dev"]


# FROM node:20

# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY tsconfig.json vite.config.js ./
# COPY src ./src

# RUN npm run build

# EXPOSE 3000

# CMD ["node", "dist/app.js"]

