FROM node:18-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate --schema=./prisma/schema.prisma

RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]