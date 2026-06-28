# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer cache)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .

# Vite bakes env vars at compile time — pass them as build args
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

# ── Stage 2: Serve ───────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Cloud Run injects PORT at runtime; nginx listens on it via envsubst
ENV PORT=8080
EXPOSE 8080

# Use shell form so envsubst can run before nginx starts
CMD ["/bin/sh", "-c", "envsubst '$PORT' < /etc/nginx/conf.d/app.conf > /tmp/app.conf && cp /tmp/app.conf /etc/nginx/conf.d/app.conf && nginx -g 'daemon off;'"]
