# FROM debian:latest

# RUN apt-get update && apt-get install -y curl
# RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
#     && apt-get install -y nodejs
# RUN npm install -g typescript http-server
# RUN mkdir -p /website
# COPY ./*.* /website

# CMD ["bash"]
# # "http-server", ".", "-p", "8080"
#     # rm -rf /var/lib/apt/lists/*

# Use Node LTS
FROM node:20

# Set working directory
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY tsconfig.json ./
COPY src/ ./src
RUN mkdir dest
COPY src/index.html src/style.css ./dest
RUN npm install -g typescript
RUN tsc


# Expose port
EXPOSE 3000

# Start a simple server to serve HTML
RUN npm install -g serve
CMD sh -c "npx tsc -w & serve -s dest -l 3000"


