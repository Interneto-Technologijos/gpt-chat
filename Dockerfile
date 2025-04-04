FROM node:18-alpine

WORKDIR /opt/gtp-chat

ADD back-end/config back-end/config
ADD back-end/node_modules back-end/node_modules
ADD back-end/src back-end/src
ADD back-end/.env back-end/.env
ADD front-end/public front-end/public

WORKDIR /opt/gtp-chat/back-end

EXPOSE 3001

CMD ["node", "src/index"]
