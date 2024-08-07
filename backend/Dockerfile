# Utiliser une image node officielle comme image de base compatible ARM
FROM arm32v7/node:21.4.0-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
