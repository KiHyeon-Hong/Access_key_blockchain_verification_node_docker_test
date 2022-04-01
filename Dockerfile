FROM node:16

WORKDIR /usr/src

COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 65006

CMD [ "node", "mainController.js" ]