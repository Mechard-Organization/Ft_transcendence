
FROM node:20

WORKDIR /app

COPY frontend/package*.json ./

RUN npm install

RUN npm install validator zxcvbn

COPY frontend/tsconfig.json frontend/vite.config.js ./
COPY frontend/src ./src

EXPOSE 3000

CMD ["npm", "run", "dev"]
