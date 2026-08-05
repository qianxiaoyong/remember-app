#!/bin/sh
set -eu

cd /app/apps/api
npx prisma generate
npx prisma migrate deploy
exec node dist/main.js
