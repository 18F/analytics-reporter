FROM node:7.8-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

COPY package.json /usr/src/app/

RUN npm install && \
    npm cache clean

COPY . /usr/src/app
RUN npm link

ENTRYPOINT ["analytics"]
