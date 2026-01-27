FROM node:20-alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables phải được set lúc build nếu dùng NEXT_PUBLIC_
# Tuy nhiên với Docker, ta thường build generic và inject env lúc run time (nâng cao).
# Để đơn giản, disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build Arguments - cho phép truyền variable lúc build từ CI/CD (Dokploy/GitHub Actions)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# Gán giá trị từ ARG vào ENV để Next.js sử dụng
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:3000}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-https://mock-project.supabase.co}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:-mock-anon-key}

# Các biến server-side (NextAuth, Google) thường không cần thiết lúc build static page
# Nhưng nếu code có gọi đến chúng ở top-level file, ta cần mock giá trị để tránh lỗi build
ENV NEXTAUTH_SECRET=mock-secret-build-only
ENV NEXTAUTH_URL=http://localhost:3000
ENV GOOGLE_CLIENT_ID=mock-client-id
ENV GOOGLE_CLIENT_SECRET=mock-client-secret
ENV SUPABASE_SERVICE_ROLE_KEY=mock-key-build-only

RUN npm run build

# Stage 3: Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy thư mục public và .next/static
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]