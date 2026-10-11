# Test-runner image (no browsers — they live in Selenium Grid, GRID_URL).
FROM node:24-slim
WORKDIR /workspace
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV RUNNER=grid CI=true
ENTRYPOINT ["npx", "mocha"]
