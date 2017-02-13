FROM resin/raspberrypi-node

HEALTHCHECK CMD ["curl", "http://localhost:4500/health"]

WORKDIR /code/

ADD ./package.json ./package.json

RUN npm install --production

ADD ./index.js ./index.js

CMD ["node", "index.js"]
