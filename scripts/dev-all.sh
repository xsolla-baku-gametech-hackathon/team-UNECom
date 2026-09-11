#!/usr/bin/env bash
# Bütün 3 servisi (engine, api, web) lokal ayağa qaldırır.
#
# İstifadə: ./scripts/dev-all.sh
# Dayandırmaq: Ctrl+C (hamısını öldürür)
#
# Tələblər:
#   - engine/.venv yoxdursa yaradılır, requirements.txt quraşdırılır
#   - api/.env-də DATABASE_URL olmalıdır (Postgres, məs. Neon) — yoxdursa
#     xəbərdarlıq edib dayanır
#   - web/.env.local avtomatik yaradılır/yenilənir (VITE_API_BASE_URL)

set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

ENGINE_PORT=8000
API_PORT=3001
WEB_PORT=5173

mkdir -p /tmp/fraud-radar-logs
PIDS=()

cleanup() {
  echo
  echo "Dayandırılır..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
  echo "Hamısı dayandırıldı."
}
trap cleanup EXIT INT TERM

echo "=== 1/3 engine (FastAPI, :$ENGINE_PORT) ==="
cd "$ROOT/engine"
if [ ! -d .venv ]; then
  echo "venv yaradılır..."
  python3 -m venv .venv
fi
./.venv/bin/pip install --quiet -r requirements.txt

if [ -f .env ]; then
  set -a; source .env; set +a
else
  echo "  (engine/.env yoxdur — ANTHROPIC_API_KEY olmadan işə düşür, /explain şablon izah qaytaracaq)"
fi

./.venv/bin/python -m uvicorn app.main:app --port "$ENGINE_PORT" \
  > /tmp/fraud-radar-logs/engine.log 2>&1 &
PIDS+=($!)

echo "=== 2/3 api (Fastify, :$API_PORT) ==="
cd "$ROOT/api"
if [ ! -f .env ]; then
  echo "XƏTA: api/.env yoxdur. api/.env.example-i kopyalayıb DATABASE_URL-i doldur:"
  echo "  cp api/.env.example api/.env"
  exit 1
fi
npm install --silent
npx prisma generate --silent 2>/dev/null || npx prisma generate

# Lokal engine-ə göstər (Render-dəki canlıya yox), qalanını .env-dən götür.
# --env-file-if-exists vacibdir: onsuz api/.env-dən yalnız DATABASE_URL oxunur
# (onu Prisma özü yükləyir), ALLOW_DEMO_RESET isə yüklənmir və logodan reset
# 403 qaytarır. Komanda sətrindəki ENGINE_URL/PORT .env-dəkindən üstündür.
ENGINE_URL="http://localhost:$ENGINE_PORT" PORT="$API_PORT" \
  npx tsx watch --env-file-if-exists=.env src/server.ts \
  > /tmp/fraud-radar-logs/api.log 2>&1 &
PIDS+=($!)

echo "=== 3/3 web (Vite, :$WEB_PORT) ==="
cd "$ROOT/web"
echo "VITE_API_BASE_URL=http://localhost:$API_PORT" > .env.local
npm install --silent

npm run dev -- --port "$WEB_PORT" \
  > /tmp/fraud-radar-logs/web.log 2>&1 &
PIDS+=($!)

sleep 3
echo
echo "=================================================="
echo " engine  http://localhost:$ENGINE_PORT/health"
echo " api     http://localhost:$API_PORT/health"
echo " web     http://localhost:$WEB_PORT"
echo
echo " Loglar: /tmp/fraud-radar-logs/{engine,api,web}.log"
echo " Dayandırmaq üçün Ctrl+C"
echo "=================================================="

wait
