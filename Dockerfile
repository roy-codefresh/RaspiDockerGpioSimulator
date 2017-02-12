FROM resin/rpi-raspbian:jessie-20160831

RUN apt-get update && \  
    apt-get -qy install curl \
                build-essential python \
                ca-certificates

WORKDIR /root/

RUN curl -O \  
        https://nodejs.org/dist/v4.5.0/node-v4.5.0-linux-armv6l.tar.gz

RUN tar -xvf node-*.tar.gz -C /usr/local \  
        --strip-components=1

WORKDIR /code/

ADD ./package.json ./package.json

RUN npm install --production

ADD ./index.js ./index.js

CMD ["node", "index.js"]
