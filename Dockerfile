
FROM node:20

WORKDIR /app

COPY ./srcs/public/package*.json ./

RUN npm install

RUN npm install validator zxcvbn

COPY ./srcs/public/tsconfig.json ./srcs/public/vite.config.js ./
COPY ./srcs/config/ ./src

EXPOSE 3000

CMD ["npm", "run", "dev"]
