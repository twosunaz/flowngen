# Build local monorepo image
# docker build --no-cache -t  flowise .

# Run image
# docker run -d -p 3000:3000 flowise

FROM node:20-alpine
RUN apk add --update libc6-compat python3 make g++
# needed for pdfjs-dist
RUN apk add --no-cache build-base cairo-dev pango-dev

# Install Chromium
RUN apk add --no-cache chromium

RUN apk update && \
    apk add --no-cache postgresql-client netcat-openbsd

#install PNPM globaly
RUN npm install -g pnpm

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

ENV NODE_OPTIONS=--max-old-space-size=8192

WORKDIR /usr/src

# Copy app source
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .

RUN pnpm build

# Create necessary directories
RUN mkdir -p ./.flowise ./.flowise/logs ./.flowise/storage


EXPOSE 3000

CMD [ "pnpm", "start" ]
