# Build local monorepo image
# docker build --no-cache -t  flowise .

# Run image
# docker run -d -p 3000:3000 flowise

FROM node:20-alpine

# Install base dependencies
RUN apk add --update libc6-compat python3 make g++
# Needed for pdfjs-dist
RUN apk add --no-cache build-base cairo-dev pango-dev

# Install Chromium
RUN apk add --no-cache chromium

# PostgreSQL client & networking tools
RUN apk update && \
    apk add --no-cache postgresql-client netcat-openbsd

# Install pnpm globally and manually set PNPM_HOME (instead of using pnpm setup)
RUN npm install -g pnpm
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN pnpm add -g turbo

# Puppeteer Chromium path setup
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Increase memory allocation
ENV NODE_OPTIONS=--max-old-space-size=8192

WORKDIR /usr/src

# Copy and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
# Install vite for frontend builds
RUN pnpm add -Dw vite
COPY . .

# Build project
RUN pnpm build

# Create persistent directories
RUN mkdir -p ./.flowise ./.flowise/logs ./.flowise/storage

EXPOSE 3000

CMD [ "pnpm", "start" ]
