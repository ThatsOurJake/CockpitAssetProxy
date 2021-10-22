FROM node:14-alpine as build

WORKDIR /build

COPY ./src ./src
COPY ./package.json ./package.json
COPY ./tsconfig.json ./tsconfig.json

RUN yarn
RUN yarn build



FROM node:14-alpine as prod_modules

WORKDIR /prod_modules

COPY ./package.json ./package.json

RUN yarn install --production=true



FROM node:14-alpine

WORKDIR /cap

COPY --from=build /build/lib ./lib
COPY --from=prod_modules /prod_modules/node_modules ./node_modules
COPY ./package.json ./package.json

ENTRYPOINT yarn start
