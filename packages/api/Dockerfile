# The calculation service. Build from the repository root:
#   docker build -f packages/api/Dockerfile -t calc-service .
FROM node:22-slim
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.4.0 --activate

# The workspace manifests first, so the install layer is reused while only sources change.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages/api/package.json packages/api/
COPY packages/atlas/package.json packages/atlas/
COPY packages/core/package.json packages/core/
COPY packages/ephemeris/package.json packages/ephemeris/
RUN pnpm install --frozen-lockfile --prod --filter "@reverse/api..."

COPY packages/api/src packages/api/src
COPY packages/atlas/src packages/atlas/src
COPY packages/atlas/data packages/atlas/data
COPY packages/atlas/tzdata packages/atlas/tzdata
COPY packages/core/src packages/core/src
COPY packages/ephemeris/src packages/ephemeris/src

ENV NODE_ENV=production PORT=8080
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD node -e "fetch('http://localhost:'+process.env.PORT+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
WORKDIR /app/packages/api
CMD ["pnpm", "exec", "tsx", "src/main.ts"]
