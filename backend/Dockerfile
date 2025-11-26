FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN npm install better-sqlite3

RUN npm install bcrypt jsonwebtoken
RUN npm install -D typescript ts-node @types/node @types/bcrypt @types/jsonwebtoken
RUN npx tsc --init

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]
