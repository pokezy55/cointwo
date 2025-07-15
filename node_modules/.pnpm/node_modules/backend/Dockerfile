# apps/backend/Dockerfile
FROM node:20

WORKDIR /app

# Copy root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Copy packages (shared code)
COPY packages ./packages
# Copy backend source
COPY apps/backend ./

RUN npm install -g pnpm
RUN pnpm install --filter backend...

# Generate Prisma client (jika pakai Prisma)
RUN pnpm exec prisma generate

EXPOSE 4000
CMD ["pnpm", "dev"] 