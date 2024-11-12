FROM node:14

RUN mkdir -p /backend-app
WORKDIR /backend-app/
COPY package.json .
RUN npm install
WORKDIR /backend-app/server
COPY ./server ./server
CMD [ "nodemon", "server/index.js" ]
