FROM node:18-alpine

WORKDIR /usr/src/app

# Installation des dépendances pour la compilation
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    gcc \
    libc-dev \
    linux-headers

# Copie des fichiers package
COPY package*.json ./

# Suppression du node_modules s'il existe et clean install
RUN rm -rf node_modules
RUN npm ci
RUN npm rebuild bcrypt --build-from-source

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]