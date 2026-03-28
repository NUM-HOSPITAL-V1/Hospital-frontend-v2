# ---------- BASE ----------
FROM node:20-alpine AS base
WORKDIR /app

# ---------- DEPS ----------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# ---------- BUILDER ----------
FROM base AS builder
ENV NODE_ENV=production
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ---------- RUNNER ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_PUBLIC_BACKEND_URL=http://backend:8000

RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# 👇 ownership fix (маш чухал)
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public

# 👇 cache permission fix
RUN mkdir -p /app/.next/cache && chown -R nextjs:nextjs /app

USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]
