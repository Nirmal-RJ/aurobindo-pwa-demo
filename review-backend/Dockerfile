FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src/main.mjs src/firestore-store.mjs src/server.mjs src/policy.mjs src/disconnected.mjs ./src/
ENV NODE_ENV=production
USER node
CMD ["node", "src/main.mjs"]



