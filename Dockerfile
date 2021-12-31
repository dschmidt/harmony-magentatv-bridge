FROM node:16-alpine
ADD . /usr/local

WORKDIR /usr/local
RUN npm ci
ENTRYPOINT [ "/usr/local/bin/harmony-magentatv-bridge.js" ]