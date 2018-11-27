FROM node: 8.12.0 - jessie

WORDDIR /var/app
COPY package.json . 
RUN npm install --only=prod
COPY ..
ENV NODE ENV production
#CMD ["npm", "start"]