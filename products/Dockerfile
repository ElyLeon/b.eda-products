FROM node:8.12.0-jessie

WORKDIR /var/app

COPY package.json .

RUN npm install --only=prod

COPY . .

ENV NODE_ENV production

EXPOSE 8002

CMD [ "npm", "run", "start" ]