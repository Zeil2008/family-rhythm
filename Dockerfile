FROM node:24-bookworm-slim

WORKDIR /app

COPY package.json server.js ./
COPY docker-entrypoint.sh /usr/local/bin/family-dashboard-entrypoint
COPY src ./src
COPY public ./public

RUN chmod +x /usr/local/bin/family-dashboard-entrypoint \
    && mkdir -p /app/data \
    && chown -R node:node /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    DB_PATH=/app/data/family.db \
    TZ=Asia/Shanghai

USER root

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/auth').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

ENTRYPOINT ["family-dashboard-entrypoint"]
CMD ["node", "server.js"]
