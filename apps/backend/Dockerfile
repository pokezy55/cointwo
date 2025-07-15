# apps/backend/Dockerfile
FROM node:20

WORKDIR /app

# Copy root files
COPY ../../pnpm-lock.yaml ../../package.json ../../pnpm-workspace.yaml ./
# Copy packages (shared code)
COPY ../../packages ./packages
# Copy backend source
COPY . .

RUN npm install -g pnpm
RUN pnpm install --filter backend...

# Generate Prisma client (jika pakai Prisma)
RUN pnpm exec prisma generate

EXPOSE 4000
CMD ["pnpm", "dev"] 