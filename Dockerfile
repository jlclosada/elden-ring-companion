# syntax=docker/dockerfile:1

# ---------- Dependencias ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- Desarrollo (Vite con recarga en caliente) ----------
FROM deps AS dev
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# ---------- Build de producción ----------
FROM deps AS build
COPY . .
# Las teselas del mapa se generan una vez en local (npm run map) y se copian con el contexto.
# Si no existen, se generan aquí (descarga ≈380 MB).
RUN test -f public/tiles/surface/0/0/0.webp || (apk add --no-cache unzip && npm run map)
RUN npm run build

# ---------- Servidor estático ----------
FROM nginx:1.27-alpine AS prod
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ >/dev/null || exit 1
