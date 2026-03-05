FROM node:20

WORKDIR /usr/src/yplaza

COPY package.json ./
COPY package-lock.json ./
RUN npm i

COPY . .

EXPOSE 3030
CMD ["npx", "tsx", "server.ts"]